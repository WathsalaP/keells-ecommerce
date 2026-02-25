package lk.keells.service;

import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class FakePaymentGatewayService {

    public boolean processPayment(String cardNumber) {

        // SUCCESS CARD
        if ("4111111111111111".equals(cardNumber)) {
            return true;
        }

        // DECLINED CARD
        if ("4000000000000002".equals(cardNumber)) {
            throw new RuntimeException("Card Declined");
        }

        // INSUFFICIENT FUNDS
        if ("4000000000009995".equals(cardNumber)) {
            throw new RuntimeException("Insufficient Funds");
        }

        throw new RuntimeException("Invalid Test Card");
    }

    public String generateTransactionId() {
        return "TXN_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}