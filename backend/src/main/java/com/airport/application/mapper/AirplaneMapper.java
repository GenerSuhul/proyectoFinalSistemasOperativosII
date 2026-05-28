package com.airport.application.mapper;

import com.airport.domain.entity.Airplane;
import com.airport.presentation.dto.CatalogDtos;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface AirplaneMapper {
    CatalogDtos.AirplaneResponse toResponse(Airplane airplane);
    Airplane toEntity(CatalogDtos.AirplaneRequest request);
    void update(CatalogDtos.AirplaneRequest request, @MappingTarget Airplane airplane);
}
