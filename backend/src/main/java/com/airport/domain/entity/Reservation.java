package com.airport.domain.entity;

import com.airport.domain.model.ReservationStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "RESERVATIONS", indexes = @Index(name = "IX_RESERVATION_CODE", columnList = "CODE", unique = true))
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "reservations_seq")
    @SequenceGenerator(name = "reservations_seq", sequenceName = "SEQ_RESERVATIONS", allocationSize = 1)
    private Long id;

    @Column(name = "CODE", nullable = false, unique = true, length = 16)
    private String code;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "FLIGHT_ID", nullable = false)
    private Flight flight;

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "SEAT_ID", nullable = false, unique = true)
    private Seat seat;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false, length = 24)
    private ReservationStatus status = ReservationStatus.PENDING_PAYMENT;

    @CreationTimestamp
    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private Instant createdAt;
}
