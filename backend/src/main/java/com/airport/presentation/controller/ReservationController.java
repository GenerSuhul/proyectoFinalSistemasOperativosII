package com.airport.presentation.controller;

import com.airport.application.service.ReservationService;
import com.airport.application.service.TicketPdfService;
import com.airport.presentation.dto.ReservationDtos;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {
    private final ReservationService reservationService;
    private final TicketPdfService ticketPdfService;

    @GetMapping("/me")
    public List<ReservationDtos.ReservationResponse> mine(Authentication authentication) {
        return reservationService.myReservations(authentication.getName());
    }

    @PostMapping
    public ReservationDtos.ReservationResponse reserve(Authentication authentication, @Valid @RequestBody ReservationDtos.ReservationRequest request) {
        return reservationService.reserve(authentication.getName(), request);
    }

    @PostMapping("/{code}/pay")
    public ReservationDtos.PaymentResponse pay(Authentication authentication, @PathVariable String code, @Valid @RequestBody ReservationDtos.PaymentRequest request) {
        return reservationService.pay(authentication.getName(), code, request);
    }

    @GetMapping("/{code}/ticket")
    public ResponseEntity<byte[]> ticket(Authentication authentication, @PathVariable String code) {
        boolean admin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        byte[] pdf = ticketPdfService.render(reservationService.confirmedTicket(authentication.getName(), admin, code));
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=ticket-" + code + ".pdf")
                .body(pdf);
    }

    @PostMapping("/{code}/email-ticket")
    public ReservationDtos.TicketEmailResponse emailTicket(Authentication authentication, @PathVariable String code) {
        boolean admin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return reservationService.emailTicket(authentication.getName(), admin, code);
    }
}
