package com.airport.infrastructure.repository;

import com.airport.domain.entity.Airport;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AirportRepository extends JpaRepository<Airport, Long> {
    boolean existsByIataCodeIgnoreCase(String iataCode);
}
