package com.airport.application.service;

import com.airport.application.exception.BusinessException;
import com.airport.application.mapper.AirplaneMapper;
import com.airport.application.mapper.AirportMapper;
import com.airport.application.mapper.FlightMapper;
import com.airport.domain.entity.*;
import com.airport.domain.model.FlightStatus;
import com.airport.infrastructure.repository.*;
import com.airport.presentation.dto.CatalogDtos;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CatalogService {
    private final AirportRepository airports;
    private final AirplaneRepository airplanes;
    private final FlightRepository flights;
    private final SeatRepository seats;
    private final AirportMapper airportMapper;
    private final AirplaneMapper airplaneMapper;
    private final FlightMapper flightMapper;

    public List<CatalogDtos.AirportResponse> airports() {
        return airports.findAll().stream().map(airportMapper::toResponse).toList();
    }

    @Transactional
    public CatalogDtos.AirportResponse createAirport(CatalogDtos.AirportRequest request) {
        Airport airport = airportMapper.toEntity(request);
        airport.setIataCode(request.iataCode().toUpperCase());
        return airportMapper.toResponse(airports.save(airport));
    }

    @Transactional
    public CatalogDtos.AirportResponse updateAirport(Long id, CatalogDtos.AirportRequest request) {
        Airport airport = airports.findById(id).orElseThrow(() -> new BusinessException("Aeropuerto no encontrado"));
        airportMapper.update(request, airport);
        airport.setIataCode(request.iataCode().toUpperCase());
        return airportMapper.toResponse(airport);
    }

    public void deleteAirport(Long id) {
        airports.deleteById(id);
    }

    public List<CatalogDtos.AirplaneResponse> airplanes() {
        return airplanes.findAll().stream().map(airplaneMapper::toResponse).toList();
    }

    @Transactional
    public CatalogDtos.AirplaneResponse createAirplane(CatalogDtos.AirplaneRequest request) {
        return airplaneMapper.toResponse(airplanes.save(airplaneMapper.toEntity(request)));
    }

    @Transactional
    public CatalogDtos.AirplaneResponse updateAirplane(Long id, CatalogDtos.AirplaneRequest request) {
        Airplane airplane = airplanes.findById(id).orElseThrow(() -> new BusinessException("Avión no encontrado"));
        airplaneMapper.update(request, airplane);
        return airplaneMapper.toResponse(airplane);
    }

    public void deleteAirplane(Long id) {
        airplanes.deleteById(id);
    }

    public List<CatalogDtos.FlightResponse> searchFlights(String origin, String destination, LocalDateTime from) {
        return flights.search(origin, destination, from == null ? LocalDateTime.now().minusHours(2) : from, FlightStatus.SCHEDULED)
                .stream().map(flightMapper::toResponse).toList();
    }

    @Transactional
    public CatalogDtos.FlightResponse createFlight(CatalogDtos.FlightRequest request) {
        Airplane airplane = airplanes.findById(request.airplaneId()).orElseThrow(() -> new BusinessException("Avión no encontrado"));
        Flight flight = buildFlight(new Flight(), request, airplane);
        flight.setAvailableSeats(airplane.getCapacity());
        flights.save(flight);
        seats.saveAll(generateSeats(flight, airplane.getCapacity()));
        return flightMapper.toResponse(flight);
    }

    @Transactional
    public CatalogDtos.FlightResponse updateFlight(Long id, CatalogDtos.FlightRequest request) {
        Flight flight = flights.findById(id).orElseThrow(() -> new BusinessException("Vuelo no encontrado"));
        Airplane airplane = airplanes.findById(request.airplaneId()).orElseThrow(() -> new BusinessException("Avión no encontrado"));
        return flightMapper.toResponse(buildFlight(flight, request, airplane));
    }

    public void deleteFlight(Long id) {
        flights.deleteById(id);
    }

    public List<CatalogDtos.SeatResponse> seats(Long flightId) {
        return seats.findByFlightIdOrderBySeatNumberAsc(flightId).stream()
                .map(seat -> new CatalogDtos.SeatResponse(seat.getId(), seat.getSeatNumber(), seat.getAvailable()))
                .toList();
    }

    private Flight buildFlight(Flight flight, CatalogDtos.FlightRequest request, Airplane airplane) {
        if (!request.arrivalTime().isAfter(request.departureTime())) {
            throw new BusinessException("La llegada debe ser posterior a la salida");
        }
        flight.setFlightNumber(request.flightNumber().trim().toUpperCase());
        flight.setOrigin(airports.findById(request.originId()).orElseThrow(() -> new BusinessException("Origen no encontrado")));
        flight.setDestination(airports.findById(request.destinationId()).orElseThrow(() -> new BusinessException("Destino no encontrado")));
        flight.setAirplane(airplane);
        flight.setDepartureTime(request.departureTime());
        flight.setArrivalTime(request.arrivalTime());
        flight.setPrice(request.price());
        flight.setStatus(request.status() == null ? FlightStatus.SCHEDULED : request.status());
        return flight;
    }

    private List<Seat> generateSeats(Flight flight, int capacity) {
        List<Seat> generated = new ArrayList<>();
        String letters = "ABCDEF";
        for (int i = 0; i < capacity; i++) {
            Seat seat = new Seat();
            seat.setFlight(flight);
            seat.setSeatNumber((i / letters.length() + 1) + String.valueOf(letters.charAt(i % letters.length())));
            generated.add(seat);
        }
        return generated;
    }
}
