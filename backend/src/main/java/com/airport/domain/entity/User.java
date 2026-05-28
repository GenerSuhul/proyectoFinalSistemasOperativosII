package com.airport.domain.entity;

import com.airport.domain.model.Role;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "APP_USERS", indexes = @Index(name = "IX_USERS_EMAIL", columnList = "EMAIL", unique = true))
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "users_seq")
    @SequenceGenerator(name = "users_seq", sequenceName = "SEQ_USERS", allocationSize = 1)
    private Long id;

    @Column(name = "FULL_NAME", nullable = false, length = 140)
    private String fullName;

    @Column(name = "EMAIL", nullable = false, unique = true, length = 180)
    private String email;

    @Column(name = "PASSWORD_HASH", nullable = false, length = 120)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "ROLE", nullable = false, length = 20)
    private Role role = Role.CLIENT;

    @Column(name = "PHONE", length = 40)
    private String phone;

    @Column(name = "DOCUMENT_NUMBER", length = 60)
    private String documentNumber;

    @CreationTimestamp
    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATED_AT", nullable = false)
    private Instant updatedAt;
}
