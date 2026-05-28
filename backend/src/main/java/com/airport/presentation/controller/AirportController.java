package com.airport.presentation.controller;

import com.airport.application.service.CatalogService;
import com.airport.presentation.dto.CatalogDtos;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/airports")
@RequiredArgsConstructor
public class AirportController {
    private final CatalogService catalogService;

    @GetMapping
    public List<CatalogDtos.AirportResponse> all() {
        return catalogService.airports();
    }

    @PostMapping
    public CatalogDtos.AirportResponse create(@Valid @RequestBody CatalogDtos.AirportRequest request) {
        return catalogService.createAirport(request);
    }

    @PutMapping("/{id}")
    public CatalogDtos.AirportResponse update(@PathVariable Long id, @Valid @RequestBody CatalogDtos.AirportRequest request) {
        return catalogService.updateAirport(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        catalogService.deleteAirport(id);
    }
}
