package com.airport.application.mapper;

import com.airport.domain.entity.Flight;
import com.airport.presentation.dto.CatalogDtos;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {AirportMapper.class, AirplaneMapper.class})
public interface FlightMapper {
    CatalogDtos.FlightResponse toResponse(Flight flight);
}
