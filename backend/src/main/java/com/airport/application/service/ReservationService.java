package com.airport.application.service;

import com.airport.application.exception.BusinessException;
import com.airport.domain.entity.*;
import com.airport.domain.model.PaymentStatus;
import com.airport.domain.model.ReservationStatus;
import com.airport.infrastructure.repository.*;
import com.airport.presentation.dto.ReservationDtos;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.HexFormat;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {
    private static final Logger log = LoggerFactory.getLogger(ReservationService.class);

    private final ReservationRepository reservations;
    private final SeatRepository seats;
    private final FlightRepository flights;
    private final UserRepository users;
    private final PaymentRepository payments;
    private final TicketPdfService ticketPdfService;
    private final TicketEmailService ticketEmailService;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.payments.approval-rate}")
    private double approvalRate;

    @Transactional
    public ReservationDtos.ReservationResponse reserve(String email, ReservationDtos.ReservationRequest request) {
        User user = users.findByEmailIgnoreCase(email).orElseThrow(() -> new BusinessException("Usuario no encontrado"));
        Flight flight = flights.findById(request.flightId()).orElseThrow(() -> new BusinessException("Vuelo no encontrado"));
        Seat seat = seats.findByFlightIdAndSeatNumberIgnoreCase(request.flightId(), request.seatNumber())
                .orElseThrow(() -> new BusinessException("Asiento no encontrado"));
        if (!Boolean.TRUE.equals(seat.getAvailable()) || flight.getAvailableSeats() <= 0) {
            throw new BusinessException("Asiento no disponible");
        }
        seat.setAvailable(false);
        flight.setAvailableSeats(flight.getAvailableSeats() - 1);

        Reservation reservation = new Reservation();
        reservation.setCode(code());
        reservation.setUser(user);
        reservation.setFlight(flight);
        reservation.setSeat(seat);
        reservation.setStatus(ReservationStatus.PENDING_PAYMENT);
        return toResponse(reservations.save(reservation));
    }

    @Transactional
    public ReservationDtos.PaymentResponse pay(String email, String code, ReservationDtos.PaymentRequest request) {
        Reservation reservation = reservations.findByCode(code).orElseThrow(() -> new BusinessException("Reserva no encontrada"));
        if (!reservation.getUser().getEmail().equalsIgnoreCase(email)) {
            throw new BusinessException("Reserva no pertenece al usuario autenticado");
        }
        if (reservation.getStatus() != ReservationStatus.PENDING_PAYMENT) {
            throw new BusinessException("La reserva ya fue procesada");
        }
        boolean approved = secureRandom.nextDouble() <= approvalRate;
        reservation.setStatus(approved ? ReservationStatus.CONFIRMED : ReservationStatus.REJECTED);
        if (!approved) {
            reservation.getSeat().setAvailable(true);
            reservation.getFlight().setAvailableSeats(reservation.getFlight().getAvailableSeats() + 1);
        }
        Payment payment = new Payment();
        payment.setReservation(reservation);
        payment.setAmount(reservation.getFlight().getPrice());
        payment.setStatus(approved ? PaymentStatus.APPROVED : PaymentStatus.REJECTED);
        payment.setCardLast4(request.cardNumber().substring(request.cardNumber().length() - 4));
        payment.setAuthorizationCode("AUTH-" + code());
        payments.save(payment);

        TicketEmailService.EmailResult emailResult = new TicketEmailService.EmailResult(false, "El pago no fue aprobado; no se emitio correo.");
        if (approved) {
            try {
                emailResult = ticketEmailService.sendTicket(reservation, ticketPdfService.render(reservation));
            } catch (RuntimeException e) {
                log.error("La reserva {} fue confirmada, pero el ticket no pudo enviarse por correo", code, e);
                emailResult = new TicketEmailService.EmailResult(false, "La reserva fue confirmada, pero el PDF no pudo enviarse por correo.");
            }
        }

        return new ReservationDtos.PaymentResponse(payment.getId(), payment.getAuthorizationCode(),
                payment.getStatus(), payment.getAmount(), emailResult.sent(), emailResult.message());
    }

    @Transactional(readOnly = true)
    public List<ReservationDtos.ReservationResponse> myReservations(String email) {
        User user = users.findByEmailIgnoreCase(email).orElseThrow(() -> new BusinessException("Usuario no encontrado"));
        return reservations.findByUserIdOrderByCreatedAtDesc(user.getId()).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public Reservation confirmedTicket(String email, boolean admin, String code) {
        Reservation reservation = reservations.findByCode(code).orElseThrow(() -> new BusinessException("Reserva no encontrada"));
        if (!admin && !reservation.getUser().getEmail().equalsIgnoreCase(email)) {
            throw new BusinessException("Acceso denegado");
        }
        if (reservation.getStatus() != ReservationStatus.CONFIRMED) {
            throw new BusinessException("El ticket solo existe para reservas confirmadas");
        }
        return reservation;
    }

    @Transactional(readOnly = true)
    public ReservationDtos.TicketEmailResponse emailTicket(String email, boolean admin, String code) {
        Reservation reservation = confirmedTicket(email, admin, code);
        TicketEmailService.EmailResult result = ticketEmailService.sendTicket(reservation, ticketPdfService.render(reservation));
        return new ReservationDtos.TicketEmailResponse(result.sent(), result.message());
    }

    public ReservationDtos.ReservationResponse toResponse(Reservation reservation) {
        Flight flight = reservation.getFlight();
        String route = flight.getOrigin().getIataCode() + " - " + flight.getDestination().getIataCode();
        return new ReservationDtos.ReservationResponse(reservation.getId(), reservation.getCode(), flight.getId(),
                flight.getFlightNumber(), route, reservation.getSeat().getSeatNumber(), flight.getPrice(),
                reservation.getStatus(), reservation.getCreatedAt());
    }

    private String code() {
        byte[] bytes = new byte[5];
        secureRandom.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes).toUpperCase();
    }
}
