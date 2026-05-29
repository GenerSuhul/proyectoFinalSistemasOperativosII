package com.airport.infrastructure.bootstrap;

import com.airport.domain.entity.User;
import com.airport.domain.model.Role;
import com.airport.infrastructure.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class AdminUserInitializer implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(AdminUserInitializer.class);

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;

    @Value("${ADMIN_EMAIL:admin@airport.local}")
    private String adminEmail;

    @Value("${ADMIN_PASSWORD:}")
    private String adminPassword;

    @Override
    @Transactional
    public void run(String... args) {
        boolean exists = users.existsByEmailIgnoreCase(adminEmail);
        if (!exists && (adminPassword == null || adminPassword.isBlank())) {
            log.warn("No se creo usuario administrador porque ADMIN_PASSWORD no esta configurado");
            return;
        }
        User admin = users.findByEmailIgnoreCase(adminEmail).orElseGet(User::new);
        admin.setFullName("Administrador Airport");
        admin.setEmail(adminEmail.toLowerCase());
        if (adminPassword != null && !adminPassword.isBlank()) {
            admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        }
        admin.setRole(Role.ADMIN);
        users.save(admin);
    }
}
