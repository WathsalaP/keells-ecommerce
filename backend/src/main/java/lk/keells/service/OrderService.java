package lk.keells.service;

import lk.keells.dto.*;
import lk.keells.entity.*;
import lk.keells.repository.*;
import lk.keells.util.SecurityUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final CartItemRepository cartItemRepository;
    private final SecurityUtil securityUtil;

    public OrderService(OrderRepository orderRepository, CartRepository cartRepository, UserRepository userRepository, CartItemRepository cartItemRepository, SecurityUtil securityUtil) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
        this.cartItemRepository = cartItemRepository;
        this.securityUtil = securityUtil;
    }

    @Transactional
    public OrderDto checkout(CheckoutRequest request, Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Cart cart = cartRepository.findByUserId(userId).orElseThrow(() -> new RuntimeException("Cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty. Add items before checkout.");
        }

        String fullAddress = request.getProvince() + ", " + request.getDistrict() + " - " + request.getDeliveryAddress();
        String orderNumber = "KELL" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        Order order = new Order();
        order.setOrderNumber(orderNumber);
        order.setUser(user);
        order.setDeliveryAddress(fullAddress);
        order.setContactPhone(request.getContactPhone());
        order.setPaymentCompleted(false); // Fake payment - always success
        order.setStatus(Order.OrderStatus.READY);

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem ci : cart.getItems()) {
            Product p = ci.getProduct();
            BigDecimal unitPrice = p.getPrice();
            if (p.getDiscount() != null && p.getDiscount().isActive()) {
                BigDecimal disc = p.getDiscount().getPercentage();
                unitPrice = p.getPrice().multiply(BigDecimal.ONE.subtract(disc.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP)));
            }
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(ci.getQuantity()));

            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setProduct(p);
            oi.setQuantity(ci.getQuantity());
            oi.setUnitPrice(unitPrice.setScale(2, RoundingMode.HALF_UP));
            oi.setTotalPrice(lineTotal.setScale(2, RoundingMode.HALF_UP));
            orderItems.add(oi);
            totalAmount = totalAmount.add(lineTotal);
        }

        order.setTotalAmount(totalAmount.setScale(2, RoundingMode.HALF_UP));
        order.setItems(orderItems);

        // Add initial tracking
        OrderTracking ot = new OrderTracking();
        ot.setOrder(order);
        ot.setStatus(Order.OrderStatus.READY);
        ot.setDescription("Order placed successfully. Your order is being prepared.");
        order.getTrackingHistory().add(ot);

        order = orderRepository.save(order);

        // Clear cart
        cart.getItems().clear();
        cartRepository.save(cart);

        return toOrderDto(order);
    }

    public List<OrderDto> getMyOrders(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return orderRepository.findByUserOrderByOrderDateDesc(user).stream()
                .map(this::toOrderDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderDtoForAdmin(Order order) {
        return toOrderDto(order);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getAllOrdersForAdmin() {
        return orderRepository.findAll().stream()
                .sorted((a, b) -> b.getOrderDate().compareTo(a.getOrderDate()))
                .map(this::toOrderDto)
                .toList();
    }

    public OrderDto getOrderByNumber(String orderNumber, Long userId) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        return toOrderDto(order);
    }

    private OrderDto toOrderDto(Order o) {
        OrderDto dto = new OrderDto();
        dto.setId(o.getId());
        dto.setOrderNumber(o.getOrderNumber());
        dto.setTotalAmount(o.getTotalAmount());
        dto.setDeliveryAddress(o.getDeliveryAddress());
        dto.setContactPhone(o.getContactPhone());
        dto.setOrderDate(o.getOrderDate());
        dto.setStatus(o.getStatus().name());
        dto.setPaymentCompleted(o.isPaymentCompleted());

        List<OrderItemDto> items = new ArrayList<>();
        for (OrderItem oi : o.getItems()) {
            OrderItemDto oid = new OrderItemDto();
            oid.setProductId(oi.getProduct().getId());
            oid.setProductName(oi.getProduct().getName());
            oid.setQuantity(oi.getQuantity());
            oid.setUnitPrice(oi.getUnitPrice());
            oid.setTotalPrice(oi.getTotalPrice());
            items.add(oid);
        }
        dto.setItems(items);

        List<OrderTrackingDto> tracking = new ArrayList<>();
        for (OrderTracking t : o.getTrackingHistory()) {
            OrderTrackingDto td = new OrderTrackingDto();
            td.setStatus(t.getStatus().name());
            td.setDescription(t.getDescription());
            td.setTimestamp(t.getTimestamp());
            tracking.add(td);
        }
        dto.setTrackingHistory(tracking);
        return dto;
    }
}
