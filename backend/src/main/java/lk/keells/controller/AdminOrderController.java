package lk.keells.controller;

import lk.keells.dto.OrderDto;
import lk.keells.entity.Order;
import lk.keells.entity.OrderTracking;
import lk.keells.repository.OrderRepository;
import lk.keells.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    private final OrderRepository orderRepository;
    private final OrderService orderService;

    public AdminOrderController(OrderRepository orderRepository, OrderService orderService) {
        this.orderRepository = orderRepository;
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<List<OrderDto>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrdersForAdmin());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderDto> updateStatus(@PathVariable Long id, @RequestBody StatusRequest req) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
        Order.OrderStatus newStatus = Order.OrderStatus.valueOf(req.getStatus());
        order.setStatus(newStatus);

        OrderTracking ot = new OrderTracking();
        ot.setOrder(order);
        ot.setStatus(newStatus);
        ot.setDescription(req.getDescription() != null ? req.getDescription() : "Status updated to " + newStatus);
        order.getTrackingHistory().add(ot);

        order = orderRepository.save(order);
        return ResponseEntity.ok(orderService.getOrderDtoForAdmin(order));
    }

    public static class StatusRequest {
        private String status;
        private String description;
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }
}
