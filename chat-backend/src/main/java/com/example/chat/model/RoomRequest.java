package com.example.chat.model;

public class RoomRequest {
    private String roomId;
    private String password;
    private String username;

    public RoomRequest() {
    }

    public RoomRequest(String roomId, String password, String username) {
        this.roomId = roomId;
        this.password = password;
        this.username = username;
    }

    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
