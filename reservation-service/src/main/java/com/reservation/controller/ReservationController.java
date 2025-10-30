package com.reservation.controller;

import com.reservation.model.Reservation;
import com.reservation.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    @Autowired
    private ReservationRepository reservationRepository;

    // GET → listar todas las reservas
    @GetMapping
    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    // POST → crear una nueva reserva
    @PostMapping("/api/reservations")
    public ResponseEntity<Reservation> createReservation(@RequestBody Reservation reservation) {
        Reservation saved = reservationRepository.save(reservation);

        // Llamar al Payment Service
        try {
            PaymentResponse payment = paymentClient.processPayment(saved);
            if (payment.isSuccessful()) {
                saved.setPaymentStatus(PaymentStatus.COMPLETED);
            } else {
                saved.setPaymentStatus(PaymentStatus.FAILED);
            }
        } catch (Exception e) {
            saved.setPaymentStatus(PaymentStatus.FAILED);
        }

        reservationRepository.save(saved);
        return ResponseEntity.ok(saved);
    }
}