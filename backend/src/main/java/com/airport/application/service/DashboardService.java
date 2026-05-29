package com.airport.application.service;

import com.airport.domain.model.FlightStatus;
import com.airport.domain.model.ReservationStatus;
import com.airport.infrastructure.repository.FlightRepository;
import com.airport.infrastructure.repository.PaymentRepository;
import com.airport.infrastructure.repository.ReservationRepository;
import com.airport.infrastructure.repository.UserRepository;
import com.airport.presentation.dto.AdminDtos;
import com.airport.presentation.dto.DashboardResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

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

    public List<AdminDtos.AdminReservationResponse> reservations() {
        return reservations.findTop80ByOrderByCreatedAtDesc().stream()
                .map(reservation -> {
                    var flight = reservation.getFlight();
                    var payment = payments.findByReservationId(reservation.getId()).orElse(null);
                    return new AdminDtos.AdminReservationResponse(
                            reservation.getId(),
                            reservation.getCode(),
                            reservation.getStatus(),
                            reservation.getUser().getFullName(),
                            reservation.getUser().getEmail(),
                            reservation.getUser().getDocumentNumber(),
                            flight.getFlightNumber(),
                            flight.getOrigin().getIataCode() + " - " + flight.getDestination().getIataCode(),
                            flight.getOrigin().getCity(),
                            flight.getDestination().getCity(),
                            flight.getDepartureTime(),
                            reservation.getSeat().getSeatNumber(),
                            payment == null ? flight.getPrice() : payment.getAmount(),
                            payment == null ? "" : payment.getAuthorizationCode(),
                            reservation.getCreatedAt()
                    );
                })
                .toList();
    }

    public List<AdminDtos.AdminUserResponse> users() {
        return users.findTop80ByOrderByCreatedAtDesc().stream()
                .map(user -> new AdminDtos.AdminUserResponse(
                        user.getId(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getRole(),
                        user.getPhone(),
                        user.getDocumentNumber(),
                        user.getCreatedAt()
                ))
                .toList();
    }
}
