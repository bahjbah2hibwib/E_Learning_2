package com.example.elearning.security;

import com.example.elearning.model.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtTokenProvider {

    // Khóa bí mật (Chuỗi Base64 dài để an toàn - Thường để trong application.properties)
    private final String jwtSecret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private final long jwtExpirationMs = 86400000; // 24 giờ

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getUserId());
        claims.put("email", user.getEmail());
        claims.put("role", user.getRole().name());

        return Jwts.builder()
                .claims(claims)
                .subject(user.getEmail())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    public long getExpiration() {
        return jwtExpirationMs / 1000; // Trả về dạng giây (seconds)
    }

    public String getRoleFromJwtToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .get("role", String.class);
        } catch (Exception e) {
            return null; // Trả về null nếu token không hợp lệ hoặc hết hạn
        }
    }

    public Long getUserIdFromJwtToken(String token) {
        try {
            Number userId = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .get("userId", Number.class);
            return userId != null ? userId.longValue() : null;
        } catch (Exception e) {
            return null;
        }
    }
}
