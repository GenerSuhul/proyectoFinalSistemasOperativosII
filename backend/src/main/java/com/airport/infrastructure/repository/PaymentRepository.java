package com.airport.infrastructure.repository;

import com.airport.domain.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    @Query("select coalesce(sum(p.amount), 0) from Payment p where p.status = com.airport.domain.model.PaymentStatus.APPROVED")
    BigDecimal approvedRevenue();

    Optional<Payment> findByReservationId(Long reservationId);
}
