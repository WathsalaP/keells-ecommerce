package lk.keells.controller;

import jakarta.validation.Valid;
import lk.keells.dto.CartDto;
import lk.keells.dto.CheckoutRequest;
import lk.keells.dto.OrderDto;
import lk.keells.service.CartService;
import lk.keells.service.OrderService;
import lk.keells.util.SecurityUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final CartService cartService;
    private final OrderService orderService;
    private final SecurityUtil securityUtil;

    public UserController(CartService cartService, OrderService orderService, SecurityUtil securityUtil) {
        this.cartService = cartService;
        this.orderService = orderService;
        this.securityUtil = securityUtil;
    }

    @GetMapping("/cart")
    public ResponseEntity<CartDto> getCart() {
        return ResponseEntity.ok(cartService.getCart(securityUtil.getCurrentUserId()));
    }

    @PostMapping("/cart/add/{productId}")
    public ResponseEntity<CartDto> addToCart(@PathVariable Long productId, @RequestParam(defaultValue = "1") Integer quantity) {
        return ResponseEntity.ok(cartService.addItem(securityUtil.getCurrentUserId(), productId, quantity));
    }

    @PutMapping("/cart/update/{cartItemId}")
    public ResponseEntity<CartDto> updateCartItem(@PathVariable Long cartItemId, @RequestParam Integer quantity) {
        return ResponseEntity.ok(cartService.updateQuantity(securityUtil.getCurrentUserId(), cartItemId, quantity));
    }

    @DeleteMapping("/cart/remove/{cartItemId}")
    public ResponseEntity<CartDto> removeFromCart(@PathVariable Long cartItemId) {
        return ResponseEntity.ok(cartService.removeItem(securityUtil.getCurrentUserId(), cartItemId));
    }

    @PostMapping("/checkout")
    public ResponseEntity<OrderDto> checkout(@Valid @RequestBody CheckoutRequest request) {
        return ResponseEntity.ok(orderService.checkout(request, securityUtil.getCurrentUserId()));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<OrderDto>> getMyOrders() {
        return ResponseEntity.ok(orderService.getMyOrders(securityUtil.getCurrentUserId()));
    }

    @GetMapping("/orders/{orderNumber}")
    public ResponseEntity<OrderDto> getOrderDetails(@PathVariable String orderNumber) {
        return ResponseEntity.ok(orderService.getOrderByNumber(orderNumber, securityUtil.getCurrentUserId()));
    }
}
