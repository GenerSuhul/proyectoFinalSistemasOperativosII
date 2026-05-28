package com.airport.application.mapper;

import com.airport.domain.entity.Airport;
import com.airport.presentation.dto.CatalogDtos;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface AirportMapper {
    CatalogDtos.AirportResponse toResponse(Airport airport);
    Airport toEntity(CatalogDtos.AirportRequest request);
    void update(CatalogDtos.AirportRequest request, @MappingTarget Airport airport);
}
