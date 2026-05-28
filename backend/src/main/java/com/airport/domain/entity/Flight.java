package com.airport.domain.entity;

import com.airport.domain.model.FlightStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "FLIGHTS", indexes = {
        @Index(name = "IX_FLIGHT_ROUTE_DATE", columnList = "ORIGIN_ID,DESTINATION_ID,DEPARTURE_TIME"),
        @Index(name = "IX_FLIGHT_NUMBER", columnList = "FLIGHT_NUMBER", unique = true)
})
public class Flight {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "flights_seq")
    @SequenceGenerator(name = "flights_seq", sequenceName = "SEQ_FLIGHTS", allocationSize = 1)
    private Long id;

    @Column(name = "FLIGHT_NUMBER", nullable = false, length = 20, unique = true)
    private String flightNumber;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "ORIGIN_ID", nullable = false)
    private Airport origin;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "DESTINATION_ID", nullable = false)
    private Airport destination;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "AIRPLANE_ID", nullable = false)
    private Airplane airplane;

    @Column(name = "DEPARTURE_TIME", nullable = false)
    private LocalDateTime departureTime;

    @Column(name = "ARRIVAL_TIME", nullable = false)
    private LocalDateTime arrivalTime;

    @Column(name = "PRICE", nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "AVAILABLE_SEATS", nullable = false)
    private Integer availableSeats;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false, length = 20)
    private FlightStatus status = FlightStatus.SCHEDULED;
}
