package com.airport.infrastructure.repository;

import com.airport.domain.entity.Reservation;
import com.airport.domain.model.ReservationStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUserIdOrderByCreatedAtDesc(Long userId);

    @EntityGraph(attributePaths = {"user", "flight", "flight.origin", "flight.destination", "flight.airplane", "seat"})
    Optional<Reservation> findByCode(String code);

    @EntityGraph(attributePaths = {"user", "flight", "flight.origin", "flight.destination", "flight.airplane", "seat"})
    List<Reservation> findTop80ByOrderByCreatedAtDesc();

    long countByStatus(ReservationStatus status);
}
