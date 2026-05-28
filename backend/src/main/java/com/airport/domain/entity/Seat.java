package com.airport.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "SEATS", uniqueConstraints = @UniqueConstraint(name = "UK_SEAT_FLIGHT_NUMBER", columnNames = {"FLIGHT_ID", "SEAT_NUMBER"}))
public class Seat {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seats_seq")
    @SequenceGenerator(name = "seats_seq", sequenceName = "SEQ_SEATS", allocationSize = 1)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "FLIGHT_ID", nullable = false)
    private Flight flight;

    @Column(name = "SEAT_NUMBER", nullable = false, length = 8)
    private String seatNumber;

    @Column(name = "AVAILABLE", nullable = false)
    private Boolean available = true;
}
