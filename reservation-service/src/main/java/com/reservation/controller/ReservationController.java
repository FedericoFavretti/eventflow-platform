package com.reservation.controller;

import com.reservation.model.Reservation;
import com.reservation.model.PaymentStatus;
import com.reservation.payment.PaymentClient;
import com.reservation.payment.PaymentResponse;
import com.reservation.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private PaymentClient paymentClient;

    // GET → listar todas las reservas
    @GetMapping
    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    // POST → crear una nueva reserva
    @PostMapping
    public ResponseEntity<Reservation> createReservation(@RequestBody Reservation reservation) {
        // Mark as pending and save first (compensation will update status)
        reservation.setPaymentStatus(PaymentStatus.PENDING);
        Reservation saved = reservationRepository.save(reservation);

        // If payment client is configured, attempt payment and update status
        if (paymentClient != null && paymentClient.isConfigured()) {
            try {
                PaymentResponse payment = paymentClient.processPayment(saved);
                if (payment != null && payment.isSuccessful()) {
                    saved.setPaymentStatus(PaymentStatus.COMPLETED);
                } else {
                    // Payment returned unsuccessful -> mark failed (compensation)
                    saved.setPaymentStatus(PaymentStatus.FAILED);
                }
            } catch (Exception e) {
                // On exception, mark payment as failed so system can retry/compensate later
                saved.setPaymentStatus(PaymentStatus.FAILED);
            }
            reservationRepository.save(saved);
        }

        return ResponseEntity.ok(saved);
    }

    // GET → obtener reserva por ID
    @GetMapping("/{id}")
    public ResponseEntity<Reservation> getReservationById(@PathVariable Long id) {
        return reservationRepository.findById(id)
            .map(reservation -> ResponseEntity.ok(reservation))
            .orElse(ResponseEntity.notFound().build());
    }
}