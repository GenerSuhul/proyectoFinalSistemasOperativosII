package com.airport.presentation.dto;

import com.airport.domain.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDtos {
    private AuthDtos() {}

    public record RegisterRequest(
            @NotBlank @Size(max = 140) String fullName,
            @NotBlank @Email @Size(max = 180) String email,
            @NotBlank @Size(min = 8, max = 72) String password,
            @Size(max = 40) String phone,
            @Size(max = 60) String documentNumber
    ) {}

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}

    public record AuthResponse(String accessToken, String refreshToken, UserResponse user) {}

    public record RefreshRequest(@NotBlank String refreshToken) {}

    public record UserResponse(Long id, String fullName, String email, Role role, String phone, String documentNumber) {}
}
