package com.airport.application.service;

import com.airport.domain.model.FlightStatus;
import com.airport.domain.model.ReservationStatus;
import com.airport.infrastructure.repository.FlightRepository;
import com.airport.infrastructure.repository.PaymentRepository;
import com.airport.infrastructure.repository.ReservationRepository;
import com.airport.infrastructure.repository.UserRepository;
import com.airport.presentation.dto.DashboardResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final PaymentRepository payments;
    private final FlightRepository flights;
    private final UserRepository users;
    private final ReservationRepository reservations;

    public DashboardResponse dashboard() {
        long activeFlights = flights.search(null, null, LocalDateTime.now().minusDays(1), FlightStatus.SCHEDULED).size();
        return new DashboardResponse(payments.approvedRevenue(), activeFlights, users.count(), reservations.countByStatus(ReservationStatus.CONFIRMED));
    }
}
