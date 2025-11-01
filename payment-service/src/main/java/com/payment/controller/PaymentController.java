package com.payment.controller;

import com.payment.dto.PaymentRequest;
import com.payment.dto.PaymentResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class PaymentController {

    @PostMapping("/payments")
    public ResponseEntity<PaymentResponse> processPayment(@RequestBody PaymentRequest req) {
        // Very small mock: always succeed for now.
        PaymentResponse resp = new PaymentResponse(true, "mock-payment-success");
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/health")
    public ResponseEntity<Object> health() {
        return ResponseEntity.ok().body(java.util.Map.of("status", "UP", "service", "payment-service"));
    }
}
