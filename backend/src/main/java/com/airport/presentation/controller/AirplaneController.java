package com.airport.presentation.controller;

import com.airport.application.service.CatalogService;
import com.airport.presentation.dto.CatalogDtos;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/airplanes")
@RequiredArgsConstructor
public class AirplaneController {
    private final CatalogService catalogService;

    @GetMapping
    public List<CatalogDtos.AirplaneResponse> all() {
        return catalogService.airplanes();
    }

    @PostMapping
    public CatalogDtos.AirplaneResponse create(@Valid @RequestBody CatalogDtos.AirplaneRequest request) {
        return catalogService.createAirplane(request);
    }

    @PutMapping("/{id}")
    public CatalogDtos.AirplaneResponse update(@PathVariable Long id, @Valid @RequestBody CatalogDtos.AirplaneRequest request) {
        return catalogService.updateAirplane(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        catalogService.deleteAirplane(id);
    }
}
