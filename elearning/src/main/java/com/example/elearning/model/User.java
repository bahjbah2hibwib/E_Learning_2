package com.example.elearning.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

import lombok.experimental.SuperBuilder;

import com.example.elearning.model.enums.UserRole;

@Entity
@Table(name = "users", schema = "elearning")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class User extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column( nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "avatar_file_id", nullable = true)
    private FileEntity avatarFile;

    @Column(name = "phone", unique = true, length = 20)
    private String phone;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private UserRole role;

    @Column(name = "status", nullable = false)
    @Builder.Default
    private Boolean status = true;

}
