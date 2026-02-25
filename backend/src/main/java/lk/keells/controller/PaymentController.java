package lk.keells.controller;

import lk.keells.dto.PaymentRequest;
import lk.keells.dto.PaymentResponse;
import lk.keells.entity.Order;
import lk.keells.repository.OrderRepository;
import lk.keells.service.FakePaymentGatewayService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final FakePaymentGatewayService paymentService;
    private final OrderRepository orderRepository;

    public PaymentController(FakePaymentGatewayService paymentService,
                             OrderRepository orderRepository) {
        this.paymentService = paymentService;
        this.orderRepository = orderRepository;
    }

    @PostMapping("/process")
    public ResponseEntity<PaymentResponse> processPayment(@RequestBody PaymentRequest request) {

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.isPaymentCompleted()) {
            return ResponseEntity.badRequest()
                    .body(new PaymentResponse("FAILED", null, "Payment already completed"));
        }

        try {
            paymentService.processPayment(request.getCardNumber());

            order.setPaymentCompleted(true);
            orderRepository.save(order);

            String txnId = paymentService.generateTransactionId();

            return ResponseEntity.ok(
                    new PaymentResponse("SUCCESS", txnId, "Payment successful")
            );

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new PaymentResponse("FAILED", null, e.getMessage()));
        }
    }
}
