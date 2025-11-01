package com.reservation.controller;

import com.reservation.model.PaymentStatus;
import com.reservation.payment.PaymentClient;
import com.reservation.payment.PaymentResponse;
import com.reservation.repository.ReservationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ReservationController.class)
@AutoConfigureMockMvc(addFilters = false)
public class ReservationControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private PaymentClient paymentClient;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createReservation_shouldReturnCompleted_whenPaymentSucceeds() throws Exception {
    String json = "{\n" +
        "  \"customerName\": \"Juan Perez\",\n" +
        "  \"serviceType\": \"evento\",\n" +
        "  \"reservationDate\": \"2025-11-01T10:00:00\"\n" +
        "}";

        when(reservationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(paymentClient.isConfigured()).thenReturn(true);
        when(paymentClient.processPayment(any())).thenReturn(new PaymentResponse(true, "mock-payment-success"));

        mockMvc.perform(post("/api/reservations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentStatus").value(PaymentStatus.COMPLETED.name()));
    }

    @Test
    void listReservations_shouldReturnOk() throws Exception {
        mockMvc.perform(get("/api/reservations"))
                .andExpect(status().isOk());
    }
}
