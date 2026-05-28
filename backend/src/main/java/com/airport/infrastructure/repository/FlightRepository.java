package com.airport.infrastructure.repository;

import com.airport.domain.entity.Flight;
import com.airport.domain.model.FlightStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface FlightRepository extends JpaRepository<Flight, Long> {
    @Query("""
            select f from Flight f
            join fetch f.origin
            join fetch f.destination
            join fetch f.airplane
            where (:origin is null or upper(f.origin.iataCode) = upper(:origin))
              and (:destination is null or upper(f.destination.iataCode) = upper(:destination))
              and f.departureTime >= :from
              and f.status = :status
            order by f.departureTime asc
            """)
    List<Flight> search(@Param("origin") String origin,
                        @Param("destination") String destination,
                        @Param("from") LocalDateTime from,
                        @Param("status") FlightStatus status);
}
