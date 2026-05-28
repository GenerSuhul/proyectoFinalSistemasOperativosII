package com.airport.presentation.dto;

import java.math.BigDecimal;

public record DashboardResponse(BigDecimal sales, long activeFlights, long registeredUsers, long confirmedReservations) {
}
