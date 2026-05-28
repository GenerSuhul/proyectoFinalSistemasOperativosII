package com.airport.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "AIRPORTS", indexes = @Index(name = "IX_AIRPORT_IATA", columnList = "IATA_CODE", unique = true))
public class Airport {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "airports_seq")
    @SequenceGenerator(name = "airports_seq", sequenceName = "SEQ_AIRPORTS", allocationSize = 1)
    private Long id;

    @Column(name = "NAME", nullable = false, length = 160)
    private String name;

    @Column(name = "CITY", nullable = false, length = 100)
    private String city;

    @Column(name = "COUNTRY", nullable = false, length = 100)
    private String country;

    @Column(name = "IATA_CODE", nullable = false, length = 3, unique = true)
    private String iataCode;
}
