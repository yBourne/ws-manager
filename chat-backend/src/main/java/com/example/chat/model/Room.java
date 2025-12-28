package com.example.chat.model;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class Room {
    private String id;
    private String password;
    private Set<String> users = new HashSet<>();
    private List<ChatMessage> messageHistory = new ArrayList<>();

    public Room() {
    }

    public Room(String id, String password, Set<String> users, List<ChatMessage> messageHistory) {
        this.id = id;
        this.password = password;
        this.users = users != null ? users : new HashSet<>();
        this.messageHistory = messageHistory != null ? messageHistory : new ArrayList<>();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Set<String> getUsers() {
        return users;
    }

    public void setUsers(Set<String> users) {
        this.users = users;
    }

    public List<ChatMessage> getMessageHistory() {
        return messageHistory;
    }

    public void setMessageHistory(List<ChatMessage> messageHistory) {
        this.messageHistory = messageHistory;
    }

    // Manual Builder
    public static RoomBuilder builder() {
        return new RoomBuilder();
    }

    public static class RoomBuilder {
        private String id;
        private String password;
        private Set<String> users = new HashSet<>();
        private List<ChatMessage> messageHistory = new ArrayList<>();

        public RoomBuilder id(String id) {
            this.id = id;
            return this;
        }

        public RoomBuilder password(String password) {
            this.password = password;
            return this;
        }

        public RoomBuilder users(Set<String> users) {
            this.users = users;
            return this;
        }

        public RoomBuilder messageHistory(List<ChatMessage> messageHistory) {
            this.messageHistory = messageHistory;
            return this;
        }

        public Room build() {
            return new Room(id, password, users, messageHistory);
        }
    }
}
