package com.example.elearning.websocket;

import lombok.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class OnlineUserManager {

    // Thông tin 1 user đang online, trả ra ngoài cho Controller (có kèm role)
    @Value
    public static class OnlineUserInfo {
        Long userId;
        String role;
    }

    // Key: sessionId, Value: thông tin user (userId + role) của session đó
    private final ConcurrentHashMap<String, OnlineUserInfo> activeSessions = new ConcurrentHashMap<>();

    public void addUser(String sessionId, Long userId, String role) {
        activeSessions.put(sessionId, new OnlineUserInfo(userId, role));
    }

    public void removeUser(String sessionId) {
        activeSessions.remove(sessionId);
    }

    public List<OnlineUserInfo> getOnlineUsers() {
        // 1 user có thể mở nhiều tab = nhiều session -> lọc unique theo userId
        Map<Long, OnlineUserInfo> uniqueByUserId = activeSessions.values().stream()
                .collect(Collectors.toMap(OnlineUserInfo::getUserId, info -> info, (a, b) -> a));
        return List.copyOf(uniqueByUserId.values());
    }
}
