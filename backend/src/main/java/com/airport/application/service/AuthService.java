package com.airport.application.service;

import com.airport.application.exception.BusinessException;
import com.airport.domain.entity.User;
import com.airport.domain.model.Role;
import com.airport.infrastructure.repository.UserRepository;
import com.airport.presentation.dto.AuthDtos;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request) {
        if (users.existsByEmailIgnoreCase(request.email())) {
            throw new BusinessException("El correo ya está registrado");
        }
        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setEmail(request.email().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.CLIENT);
        user.setPhone(request.phone());
        user.setDocumentNumber(request.documentNumber());
        users.save(user);
        return tokens(user);
    }

    @Transactional(readOnly = true)
    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        User user = users.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new BadCredentialsException("Credenciales inválidas"));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Credenciales inválidas");
        }
        return tokens(user);
    }

    @Transactional(readOnly = true)
    public AuthDtos.AuthResponse refresh(AuthDtos.RefreshRequest request) {
        Claims claims = jwtService.parse(request.refreshToken());
        if (!"refresh".equals(claims.get("type", String.class))) {
            throw new BadCredentialsException("Token inválido");
        }
        User user = users.findByEmailIgnoreCase(claims.getSubject())
                .orElseThrow(() -> new BadCredentialsException("Usuario no encontrado"));
        return tokens(user);
    }

    private AuthDtos.AuthResponse tokens(User user) {
        return new AuthDtos.AuthResponse(jwtService.accessToken(user), jwtService.refreshToken(user), toUser(user));
    }

    public AuthDtos.UserResponse toUser(User user) {
        return new AuthDtos.UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole(), user.getPhone(), user.getDocumentNumber());
    }

    @Transactional(readOnly = true)
    public AuthDtos.UserResponse currentUser(String email) {
        return users.findByEmailIgnoreCase(email).map(this::toUser)
                .orElseThrow(() -> new BusinessException("Usuario no encontrado"));
    }
}
