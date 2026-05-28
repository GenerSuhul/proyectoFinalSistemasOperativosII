package com.airport.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "AIRPLANES")
public class Airplane {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "airplanes_seq")
    @SequenceGenerator(name = "airplanes_seq", sequenceName = "SEQ_AIRPLANES", allocationSize = 1)
    private Long id;

    @Column(name = "MODEL", nullable = false, length = 120)
    private String model;

    @Column(name = "CAPACITY", nullable = false)
    private Integer capacity;

    @Column(name = "AIRLINE", nullable = false, length = 120)
    private String airline;
}
