package lk.keells.service;

import lk.keells.dto.CartDto;
import lk.keells.dto.CartItemDto;
import lk.keells.entity.*;
import lk.keells.repository.CartItemRepository;
import lk.keells.repository.CartRepository;
import lk.keells.repository.ProductRepository;
import lk.keells.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public CartService(CartRepository cartRepository, CartItemRepository cartItemRepository, UserRepository userRepository, ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    public CartDto getCart(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Cart cart = cartRepository.findByUser(user).orElseGet(() -> {
            Cart c = new Cart();
            c.setUser(user);
            return cartRepository.save(c);
        });
        return toCartDto(cart);
    }

    @Transactional
    public CartDto addItem(Long userId, Long productId, Integer quantity) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Product not found"));

        Cart cart = cartRepository.findByUser(user).orElseGet(() -> {
            Cart c = new Cart();
            c.setUser(user);
            return cartRepository.save(c);
        });

        CartItem existing = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst().orElse(null);

        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + (quantity != null ? quantity : 1));
        } else {
            CartItem item = new CartItem();
            item.setCart(cart);
            item.setProduct(product);
            item.setQuantity(quantity != null && quantity > 0 ? quantity : 1);
            cart.getItems().add(item);
        }
        cartRepository.save(cart);
        return toCartDto(cart);
    }

    @Transactional
    public CartDto updateQuantity(Long userId, Long cartItemId, Integer quantity) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Cart cart = cartRepository.findByUserId(userId).orElseThrow(() -> new RuntimeException("Cart not found"));

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(cartItemId))
                .findFirst().orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (quantity != null && quantity > 0) {
            item.setQuantity(quantity);
        } else {
            cart.getItems().remove(item);
        }
        cartRepository.save(cart);
        return toCartDto(cart);
    }

    @Transactional
    public CartDto removeItem(Long userId, Long cartItemId) {
        Cart cart = cartRepository.findByUserId(userId).orElseThrow(() -> new RuntimeException("Cart not found"));
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(cartItemId))
                .findFirst().orElseThrow(() -> new RuntimeException("Cart item not found"));
        cart.getItems().remove(item);
        cartRepository.save(cart);
        return toCartDto(cart);
    }

    private CartDto toCartDto(Cart cart) {
        CartDto dto = new CartDto();
        dto.setId(cart.getId());
        BigDecimal total = BigDecimal.ZERO;
        List<CartItemDto> items = new ArrayList<>();
        for (CartItem ci : cart.getItems()) {
            CartItemDto itemDto = new CartItemDto();
            itemDto.setId(ci.getId());
            itemDto.setProductId(ci.getProduct().getId());
            itemDto.setProductName(ci.getProduct().getName());
            itemDto.setProductImageUrl(ci.getProduct().getImageUrl());
            itemDto.setQuantity(ci.getQuantity());

            BigDecimal unitPrice = ci.getProduct().getPrice();
            if (ci.getProduct().getDiscount() != null && ci.getProduct().getDiscount().isActive()) {
                BigDecimal disc = ci.getProduct().getDiscount().getPercentage();
                unitPrice = unitPrice.multiply(BigDecimal.ONE.subtract(disc.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP)));
            }
            itemDto.setUnitPrice(unitPrice.setScale(2, RoundingMode.HALF_UP));
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(ci.getQuantity()));
            itemDto.setTotalPrice(lineTotal.setScale(2, RoundingMode.HALF_UP));
            total = total.add(lineTotal);
            items.add(itemDto);
        }
        dto.setItems(items);
        dto.setTotalAmount(total.setScale(2, RoundingMode.HALF_UP));
        dto.setTotalItems(items.stream().mapToInt(CartItemDto::getQuantity).sum());
        return dto;
    }
}
