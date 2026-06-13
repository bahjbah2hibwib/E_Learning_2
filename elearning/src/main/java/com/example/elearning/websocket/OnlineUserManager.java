package com.example.elearning.websocket;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class OnlineUserManager {
    // Key: sessionId, Value: userId
    private final ConcurrentHashMap<String, Long> activeSessions = new ConcurrentHashMap<>();

    public void addUser(String sessionId, Long userId) {
        activeSessions.put(sessionId, userId);
    }

    public void removeUser(String sessionId) {
        activeSessions.remove(sessionId);
    }

    public List<Long> getOnlineUsers() {
        // Lấy danh sách ID unique (vì 1 user có thể mở nhiều tab = nhiều session)
        return activeSessions.values().stream().distinct().collect(Collectors.toList());
    }
}
