package com.payment.dto;

// La clase modelada para una respuesta de cierto pago

public class PaymentResponse {
    private boolean successful;
    private String message;

    public PaymentResponse() {}

    public PaymentResponse(boolean successful, String message) {
        this.successful = successful;
        this.message = message;
    }

    public boolean isSuccessful() {
        return successful;
    }

    public void setSuccessful(boolean successful) {
        this.successful = successful;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
