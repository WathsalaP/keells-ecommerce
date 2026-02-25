package lk.keells.dto;

public class PaymentResponse {
    private String status;
    private String transactionId;
    private String message;

    public PaymentResponse(String status, String transactionId, String message) {
        this.status = status;
        this.transactionId = transactionId;
        this.message = message;
    }

    public String getStatus() { return status; }
    public String getTransactionId() { return transactionId; }
    public String getMessage() { return message; }
}