package com.airport.infrastructure.repository;

import com.airport.domain.entity.Seat;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import java.util.List;
import java.util.Optional;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByFlightIdOrderBySeatNumberAsc(Long flightId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Seat> findByFlightIdAndSeatNumberIgnoreCase(Long flightId, String seatNumber);
}
