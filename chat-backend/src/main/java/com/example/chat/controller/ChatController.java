package com.example.chat.controller;

import com.example.chat.model.ChatMessage;
import com.example.chat.model.Room;
import com.example.chat.model.RoomRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class ChatController {

    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);
    private static final String PUBLIC_ROOM_ID = "Public Lounge";
    private final SimpMessagingTemplate messagingTemplate;
    // In-memory room storage: Key = roomId
    private final Map<String, Room> rooms = new ConcurrentHashMap<>();

    // Track active sessions: Key = username, Value = last sessionId
    private final Map<String, String> userSessions = new ConcurrentHashMap<>();

    public ChatController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;

        // Initialize Public Lounge
        rooms.put(PUBLIC_ROOM_ID, Room.builder()
                .id(PUBLIC_ROOM_ID)
                .password("") // Empty password for public room
                .build());
        logger.info("Initialized Public Lounge room");
    }

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        String roomId = chatMessage.getRoomId();
        Room room = rooms.get(roomId);
        if (room != null) {
            logger.info("Chat message: room={}, sender={}", roomId, chatMessage.getSender());
            chatMessage.setTimestamp(Instant.now().toString());
            room.getMessageHistory().add(chatMessage);
            messagingTemplate.convertAndSend("/topic/room/" + roomId, chatMessage);
        } else {
            logger.warn("Chat message rejected: room {} not found", roomId);
        }
    }

    @MessageMapping("/chat.createRoom")
    public void createRoom(@Payload RoomRequest request, SimpMessageHeaderAccessor headerAccessor) {
        String roomId = request.getRoomId();
        String username = request.getUsername();
        logger.info("Room create request: roomId={}, user={}", roomId, username);

        if (rooms.containsKey(roomId)) {
            logger.warn("Room create failed: {} already exists", roomId);
            sendErrorMessage(username, "Room already exists!");
            return;
        }

        Room newRoom = Room.builder()
                .id(roomId)
                .password(request.getPassword())
                .build();
        rooms.put(roomId, newRoom);
        logger.info("Room created: {}", roomId);

        // Auto-join the creator
        joinRoom(request, headerAccessor);
    }

    @MessageMapping("/chat.joinRoom")
    public void joinRoom(@Payload RoomRequest request, SimpMessageHeaderAccessor headerAccessor) {
        String roomId = request.getRoomId();
        String username = request.getUsername();
        logger.info("Join request: roomId={}, user={}", roomId, username);

        Room room = rooms.get(roomId);

        if (room == null) {
            logger.warn("Join failed: room {} not found", roomId);
            sendErrorMessage(username, "Room not found!");
            return;
        }

        if (!room.getPassword().equals(request.getPassword())) {
            logger.warn("Join failed: invalid password for room {} (user={})", roomId, username);
            sendErrorMessage(username, "Invalid password!");
            return;
        }

        // Setup session attributes
        headerAccessor.getSessionAttributes().put("username", username);
        headerAccessor.getSessionAttributes().put("roomId", roomId);

        // Track this session as the active one for this user
        userSessions.put(username, headerAccessor.getSessionId());

        room.getUsers().add(username);
        logger.info("User {} joined room {}", username, roomId);

        // Send confirmation and history to the user
        ChatMessage joinMessage = ChatMessage.builder()
                .type(ChatMessage.MessageType.JOIN)
                .sender(username)
                .roomId(roomId)
                .content(username + " joined the room")
                .timestamp(Instant.now().toString())
                .build();

        // Broadcast join to the room
        messagingTemplate.convertAndSend("/topic/room/" + roomId, joinMessage);

        // Also send current room state (users and history) specifically to the joined
        // user
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/sync", room);
    }

    @MessageMapping("/chat.leaveRoom")
    public void leaveRoom(@Payload RoomRequest request, SimpMessageHeaderAccessor headerAccessor) {
        String roomId = (String) headerAccessor.getSessionAttributes().get("roomId");
        String username = (String) headerAccessor.getSessionAttributes().get("username");

        if (roomId != null && username != null) {
            logger.info("Leave request: roomId={}, user={}", roomId, username);
            userSessions.remove(username); // Explicit leave: clear session
            Room room = rooms.get(roomId);
            if (room != null) {
                room.getUsers().remove(username);

                ChatMessage leaveMessage = ChatMessage.builder()
                        .type(ChatMessage.MessageType.LEAVE)
                        .sender(username)
                        .roomId(roomId)
                        .content(username + " left the room")
                        .timestamp(Instant.now().toString())
                        .build();

                messagingTemplate.convertAndSend("/topic/room/" + roomId, leaveMessage);

                // Synchronize updated user list to all participants
                messagingTemplate.convertAndSend("/topic/room/" + roomId + "/sync", room);

                logger.info("User {} left room {}", username, roomId);
            }
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());

        if (headerAccessor.getSessionAttributes() == null) {
            return;
        }

        String username = (String) headerAccessor.getSessionAttributes().get("username");
        String roomId = (String) headerAccessor.getSessionAttributes().get("roomId");
        String sessionId = headerAccessor.getSessionId();

        if (username != null && roomId != null) {
            // Only process if this is the session we have registered for this user
            // This prevents a "ghost" disconnect from a previous session (e.g. network
            // switch)
            // from removing the user's new active session.
            String currentSessionId = userSessions.get(username);

            if (sessionId != null && sessionId.equals(currentSessionId)) {
                logger.info("User Disconnected (Active Session): {} from room {}", username, roomId);
                userSessions.remove(username);

                Room room = rooms.get(roomId);
                if (room != null) {
                    boolean removed = room.getUsers().remove(username);
                    if (removed) {
                        ChatMessage leaveMessage = ChatMessage.builder()
                                .type(ChatMessage.MessageType.LEAVE)
                                .sender(username)
                                .roomId(roomId)
                                .content(username + " disconnected")
                                .timestamp(Instant.now().toString())
                                .build();

                        messagingTemplate.convertAndSend("/topic/room/" + roomId, leaveMessage);
                        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/sync", room);
                    }
                }
            } else {
                logger.info("User Ghost Session Disconnected (Ignored): {} (id={})", username, sessionId);
            }
        }
    }

    private void sendErrorMessage(String username, String error) {
        logger.error("Error for user {}: {}", username, error);
        ChatMessage errorMessage = ChatMessage.builder()
                .type(ChatMessage.MessageType.ERROR)
                .content(error)
                .timestamp(Instant.now().toString())
                .build();
        messagingTemplate.convertAndSend("/topic/errors/" + username, errorMessage);
    }
}
