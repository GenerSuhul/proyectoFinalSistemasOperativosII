package com.airport.presentation.controller;

import com.airport.application.service.CatalogService;
import com.airport.presentation.dto.CatalogDtos;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/flights")
@RequiredArgsConstructor
public class FlightController {
    private final CatalogService catalogService;

    @GetMapping
    public List<CatalogDtos.FlightResponse> search(@RequestParam(required = false) String origin,
                                                   @RequestParam(required = false) String destination,
                                                   @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from) {
        return catalogService.searchFlights(origin, destination, from);
    }

    @PostMapping
    public CatalogDtos.FlightResponse create(@Valid @RequestBody CatalogDtos.FlightRequest request) {
        return catalogService.createFlight(request);
    }

    @PutMapping("/{id}")
    public CatalogDtos.FlightResponse update(@PathVariable Long id, @Valid @RequestBody CatalogDtos.FlightRequest request) {
        return catalogService.updateFlight(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        catalogService.deleteFlight(id);
    }

    @GetMapping("/{id}/seats")
    public List<CatalogDtos.SeatResponse> seats(@PathVariable Long id) {
        return catalogService.seats(id);
    }
}
