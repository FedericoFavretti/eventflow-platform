package com.reservation.payment;

import com.reservation.model.Reservation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

// Invoca a payment service (del microservicio payment-service)

@Service
public class PaymentClient {

    private final RestTemplate restTemplate;
    private final String paymentServiceUrl;

    @Autowired
    public PaymentClient(RestTemplateBuilder builder, @Value("${PAYMENT_SERVICE_URL:}") String paymentServiceUrl) {
        this.restTemplate = builder
                .requestFactory(() -> {
                    SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
                    factory.setConnectTimeout((int) Duration.ofSeconds(5).toMillis());
                    factory.setReadTimeout((int) Duration.ofSeconds(5).toMillis());
                    return factory;
                })
                .build();
        this.paymentServiceUrl = paymentServiceUrl;
    }

    public boolean isConfigured() {
        return paymentServiceUrl != null && !paymentServiceUrl.isBlank();
    }

    public PaymentResponse processPayment(Reservation reservation) {
        if (!isConfigured()) {
            return new PaymentResponse(false, "payment service url not configured");
        }

        try {
            HttpEntity<Reservation> request = new HttpEntity<>(reservation);
            // Expect the payment service to expose a /payments endpoint that returns PaymentResponse JSON
            ResponseEntity<PaymentResponse> resp = restTemplate.postForEntity(paymentServiceUrl + "/payments", request, PaymentResponse.class);
            if (resp.getBody() != null) {
                return resp.getBody();
            }
            return new PaymentResponse(false, "empty-response");
        } catch (Exception e) {
            return new PaymentResponse(false, e.getMessage());
        }
    }
}
