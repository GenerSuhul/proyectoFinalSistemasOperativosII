package com.airport.presentation.dto;

import com.airport.domain.model.ReservationStatus;
import com.airport.domain.model.Role;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

public final class AdminDtos {
    private AdminDtos() {}

    public record AdminReservationResponse(
            Long id,
            String code,
            ReservationStatus status,
            String passengerName,
            String passengerEmail,
            String documentNumber,
            String flightNumber,
            String route,
            String originCity,
            String destinationCity,
            LocalDateTime departureTime,
            String seatNumber,
            BigDecimal amount,
            String authorizationCode,
            Instant createdAt
    ) {}

    public record AdminUserResponse(
            Long id,
            String fullName,
            String email,
            Role role,
            String phone,
            String documentNumber,
            Instant createdAt
    ) {}
}
