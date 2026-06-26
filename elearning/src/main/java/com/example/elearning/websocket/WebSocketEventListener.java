package com.example.elearning.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final OnlineUserManager onlineUserManager;
    private final SimpMessageSendingOperations messagingTemplate;
    private final com.example.elearning.repository.UserRepository userRepository;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal user = headerAccessor.getUser();
        
        // Cần ép kiểu lại vì trong ConnectedEvent user có thể bị bọc bên trong
        if (user != null && user.getName() != null) {
            try {
                // Chúng ta đã set userId.toString() làm principal name trong Interceptor
                Long userId = Long.parseLong(user.getName());
                
                // Cố gắng lấy sessionId. Tuy nhiên SessionConnectedEvent không có sessionId trực tiếp trên accessor
                // Phải lấy thông qua native headers hoặc dùng message header
                String sessionId = (String) event.getMessage().getHeaders().get("simpSessionId");
                
                if (sessionId != null) {
                    // Lấy role từ DB
                    String role = userRepository.findById(userId)
                            .map(u -> u.getRole().name())
                            .orElse("UNKNOWN");
                            
                    onlineUserManager.addUser(sessionId, userId, role);
                    broadcastOnlineUsers();
                }
            } catch (Exception e) {
                log.error("Lỗi khi parse userId trong WebSocket Connect: {}", user.getName());
            }
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        
        if (sessionId != null) {
            onlineUserManager.removeUser(sessionId);
            broadcastOnlineUsers();
        }
    }

    private void broadcastOnlineUsers() {
        messagingTemplate.convertAndSend("/topic/online-users", onlineUserManager.getOnlineUsers());
    }
}
