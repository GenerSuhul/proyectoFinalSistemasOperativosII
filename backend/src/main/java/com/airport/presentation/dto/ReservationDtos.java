package com.airport.presentation.dto;

import com.airport.domain.model.PaymentStatus;
import com.airport.domain.model.ReservationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;

public final class ReservationDtos {
    private ReservationDtos() {}

    public record ReservationRequest(@NotNull Long flightId, @NotBlank String seatNumber) {}

    public record PaymentRequest(@NotBlank @Size(min = 12, max = 19) String cardNumber,
                                 @NotBlank String cardHolder,
                                 @NotBlank @Pattern(regexp = "^(0[1-9]|1[0-2])/\\d{2}$") String expiry,
                                 @NotBlank @Pattern(regexp = "^\\d{3,4}$") String cvv) {}

    public record ReservationResponse(Long id, String code, Long flightId, String flightNumber, String route,
                                      String seatNumber, BigDecimal amount, ReservationStatus status,
                                      Instant createdAt) {}

    public record PaymentResponse(Long id, String authorizationCode, PaymentStatus status, BigDecimal amount) {}
}
