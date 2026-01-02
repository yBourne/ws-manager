import { useState, useCallback, useRef, useEffect } from 'react';
import { Client, IFrame, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ChatMessage, Room } from '../types/chat';

export const useChat = () => {
    const [connected, setConnected] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [users, setUsers] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

    const stompClient = useRef<Client | null>(null);
    const subscriptions = useRef<StompSubscription[]>([]);
    const pendingRoomId = useRef<string | null>(null);

    const unsubscribeAll = useCallback(() => {
        console.log('Unsubscribing from all topics...');
        subscriptions.current.forEach(sub => sub.unsubscribe());
        subscriptions.current = [];
    }, []);

    const disconnect = useCallback(() => {
        unsubscribeAll();
        if (stompClient.current) {
            stompClient.current.deactivate();
            stompClient.current = null;
        }
        setConnected(false);
        setCurrentRoomId(null);
    }, [unsubscribeAll]);

    const connect = useCallback(() => {
        console.log('Connect function triggered');

        if (stompClient.current?.active) {
            console.log('UseChat: Already connected or connecting...');
            return;
        }

        const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
        const protocol = isHttps ? 'https' : 'http';
        const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

        // Use port 8080 for local development, but omit it for custom domains (assume reverse proxy)
        const isLocal = hostname === 'localhost' || hostname.startsWith('192.168.') || hostname.startsWith('127.');
        const socketUrl = isLocal
            ? `${protocol}://${hostname}:8080/ws-chat`
            : '/ws-chat'; // Relative URL for production, handled by Next.js rewrites

        console.log(`Connecting to WebSocket at: ${socketUrl} (Protocol: ${protocol}, Host: ${hostname}, env: ${isLocal ? 'LOCAL' : 'REMOTE'})`);

        const client = new Client({
            webSocketFactory: () => {
                console.log('SockJS: Factory called for URL:', socketUrl);
                return new SockJS(socketUrl);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            onConnect: (frame: IFrame) => {
                console.log('Connected to STOMP broker');
                setConnected(true);
                setError(null);
            },
            onStompError: (frame: IFrame) => {
                console.error('STOMP error:', frame.headers['message']);
                setError(`STOMP Error: ${frame.headers['message']}`);
            },
            onWebSocketError: (event) => {
                console.error('WebSocket Error:', event);
                setError('WebSocket Connection Failed. Checking system status...');
            },
            onWebSocketClose: (event) => {
                console.log('WebSocket Closed:', event);
                if (!event.wasClean) {
                    setError(`Connection lost: ${event.reason || 'Unexpected closure'}`);
                }
            },
            onDisconnect: () => {
                console.log('Disconnected from STOMP broker');
                setConnected(false);
                setCurrentRoomId(null);
                unsubscribeAll();
            }
        });

        client.activate();
        stompClient.current = client;
    }, [unsubscribeAll]);

    const subscribeToRoom = useCallback((roomId: string, username: string) => {
        if (!stompClient.current || !connected) {
            console.warn('Subscription failed: Client not connected');
            return;
        }

        // Clean up any existing subscriptions before creating new ones
        unsubscribeAll();

        console.log(`Subscribing to room: ${roomId} for user: ${username}`);

        // 1. Regular Message Delivery
        const msgSub = stompClient.current.subscribe(`/topic/room/${roomId}`, (message) => {
            console.log('STOMP: Received message:', message.body);
            const receivedMessage = JSON.parse(message.body) as ChatMessage;

            setMessages((prev) => {
                // Defensive check: don't add if we somehow got a duplicate (same object content basically)
                // In a production app, we should use unique message IDs
                return [...prev, receivedMessage];
            });
        });

        // 2. Room State Sync (History & Users)
        const syncSub = stompClient.current.subscribe(`/topic/room/${roomId}/sync`, (message) => {
            console.log('STOMP: Received room sync');
            const roomData = JSON.parse(message.body) as Room;
            setMessages(roomData.messageHistory || []);
            setUsers(roomData.users || []);

            // Only now do we treat the user as "in the room"
            setCurrentRoomId(roomId);
            pendingRoomId.current = null;
        });

        // 3. User-specific Error Channel
        const errSub = stompClient.current.subscribe(`/topic/errors/${username}`, (message) => {
            console.log('STOMP: Received error:', message.body);
            const err = JSON.parse(message.body) as ChatMessage;
            setError(err.content);
            pendingRoomId.current = null;
            setCurrentRoomId(null);
            unsubscribeAll();
        });

        subscriptions.current = [msgSub, syncSub, errSub];
    }, [connected, unsubscribeAll]);

    const createRoom = useCallback((roomId: string, password: string, username: string) => {
        if (!stompClient.current || !connected) return;
        setError(null);
        pendingRoomId.current = roomId;

        console.log('Publishing createRoom event');
        stompClient.current.publish({
            destination: '/app/chat.createRoom',
            body: JSON.stringify({ roomId, password, username })
        });

        subscribeToRoom(roomId, username);
    }, [connected, subscribeToRoom]);

    const joinRoom = useCallback((roomId: string, password: string, username: string) => {
        if (!stompClient.current || !connected) return;
        setError(null);
        pendingRoomId.current = roomId;

        console.log('Publishing joinRoom event');
        stompClient.current.publish({
            destination: '/app/chat.joinRoom',
            body: JSON.stringify({ roomId, password, username })
        });

        subscribeToRoom(roomId, username);
    }, [connected, subscribeToRoom]);

    const sendMessage = useCallback((content: string, sender: string, roomId: string) => {
        if (!stompClient.current || !connected) return;

        const chatMessage: Partial<ChatMessage> = {
            content,
            sender,
            roomId,
            type: 'CHAT'
        };

        stompClient.current.publish({
            destination: '/app/chat.sendMessage',
            body: JSON.stringify(chatMessage)
        });
    }, [connected]);

    const leaveRoom = useCallback(() => {
        if (!stompClient.current || !connected || !currentRoomId) return;

        console.log('Leaving room:', currentRoomId);
        stompClient.current.publish({
            destination: '/app/chat.leaveRoom',
            body: JSON.stringify({ roomId: currentRoomId })
        });

        setCurrentRoomId(null);
        setMessages([]);
        setUsers([]);
        unsubscribeAll();
    }, [connected, currentRoomId, unsubscribeAll]);

    useEffect(() => {
        return () => {
            console.log('Cleaning up useChat hook...');
            disconnect();
        };
    }, [disconnect]);

    return {
        connected,
        connect,
        disconnect,
        messages,
        users,
        error,
        createRoom,
        joinRoom,
        sendMessage,
        leaveRoom,
        currentRoomId
    };
};
