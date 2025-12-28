package com.example.chat.model;

public class ChatMessage {
    private MessageType type;
    private String content;
    private String sender;
    private String roomId;
    private String timestamp;

    public enum MessageType {
        CHAT,
        JOIN,
        LEAVE,
        ERROR
    }

    public ChatMessage() {
    }

    public ChatMessage(MessageType type, String content, String sender, String roomId, String timestamp) {
        this.type = type;
        this.content = content;
        this.sender = sender;
        this.roomId = roomId;
        this.timestamp = timestamp;
    }

    // Getters and Setters
    public MessageType getType() {
        return type;
    }

    public void setType(MessageType type) {
        this.type = type;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    // Manual Builder
    public static ChatMessageBuilder builder() {
        return new ChatMessageBuilder();
    }

    public static class ChatMessageBuilder {
        private MessageType type;
        private String content;
        private String sender;
        private String roomId;
        private String timestamp;

        public ChatMessageBuilder type(MessageType type) {
            this.type = type;
            return this;
        }

        public ChatMessageBuilder content(String content) {
            this.content = content;
            return this;
        }

        public ChatMessageBuilder sender(String sender) {
            this.sender = sender;
            return this;
        }

        public ChatMessageBuilder roomId(String roomId) {
            this.roomId = roomId;
            return this;
        }

        public ChatMessageBuilder timestamp(String timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public ChatMessage build() {
            return new ChatMessage(type, content, sender, roomId, timestamp);
        }
    }
}
