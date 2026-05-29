package com.airport.presentation.controller;

import com.airport.application.service.DashboardService;
import com.airport.presentation.dto.AdminDtos;
import com.airport.presentation.dto.DashboardResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final DashboardService dashboardService;

    @GetMapping("/dashboard")
    public DashboardResponse dashboard() {
        return dashboardService.dashboard();
    }

    @GetMapping("/reservations")
    public List<AdminDtos.AdminReservationResponse> reservations() {
        return dashboardService.reservations();
    }

    @GetMapping("/users")
    public List<AdminDtos.AdminUserResponse> users() {
        return dashboardService.users();
    }
}
