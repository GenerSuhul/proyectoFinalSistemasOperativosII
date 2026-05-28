package com.airport.presentation.dto;

import com.airport.domain.model.FlightStatus;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public final class CatalogDtos {
    private CatalogDtos() {}

    public record AirportRequest(@NotBlank String name, @NotBlank String city, @NotBlank String country,
                                 @NotBlank @Pattern(regexp = "^[A-Za-z]{3}$") String iataCode) {}
    public record AirportResponse(Long id, String name, String city, String country, String iataCode) {}

    public record AirplaneRequest(@NotBlank String model, @NotNull @Min(1) Integer capacity, @NotBlank String airline) {}
    public record AirplaneResponse(Long id, String model, Integer capacity, String airline) {}

    public record FlightRequest(@NotBlank String flightNumber, @NotNull Long originId, @NotNull Long destinationId,
                                @NotNull Long airplaneId, @NotNull @FutureOrPresent LocalDateTime departureTime,
                                @NotNull LocalDateTime arrivalTime, @NotNull @DecimalMin("0.01") BigDecimal price,
                                FlightStatus status) {}
    public record FlightResponse(Long id, String flightNumber, AirportResponse origin, AirportResponse destination,
                                 AirplaneResponse airplane, LocalDateTime departureTime, LocalDateTime arrivalTime,
                                 BigDecimal price, Integer availableSeats, FlightStatus status) {}

    public record SeatResponse(Long id, String seatNumber, Boolean available) {}
}
