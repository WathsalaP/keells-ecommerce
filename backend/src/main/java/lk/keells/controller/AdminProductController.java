package lk.keells.controller;

import jakarta.validation.Valid;
import lk.keells.dto.ProductCreateRequest;
import lk.keells.dto.ProductDto;
import lk.keells.entity.Category;
import lk.keells.entity.Discount;
import lk.keells.entity.Product;
import lk.keells.repository.CategoryRepository;
import lk.keells.repository.DiscountRepository;
import lk.keells.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/products")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final DiscountRepository discountRepository;

    public AdminProductController(ProductRepository productRepository, CategoryRepository categoryRepository, DiscountRepository discountRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.discountRepository = discountRepository;
    }

    @GetMapping
    public ResponseEntity<List<ProductDto>> getAllProducts() {
        return ResponseEntity.ok(productRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<ProductDto> createProduct(@Valid @RequestBody ProductCreateRequest req) {
        Category cat = categoryRepository.findById(req.getCategoryId()).orElseThrow(() -> new RuntimeException("Category not found"));
        Product p = new Product();
        p.setName(req.getName());
        p.setDescription(req.getDescription());
        p.setPrice(req.getPrice());
        p.setStockQuantity(req.getStockQuantity() != null ? req.getStockQuantity() : 0);
        p.setImageUrl(req.getImageUrl());
        p.setCategory(cat);
        if (req.getDiscountId() != null) {
            Discount d = discountRepository.findById(req.getDiscountId()).orElse(null);
            p.setDiscount(d);
        }
        p = productRepository.save(p);
        return ResponseEntity.ok(toDto(p));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDto> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductCreateRequest req) {
        Product p = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        Category cat = categoryRepository.findById(req.getCategoryId()).orElseThrow(() -> new RuntimeException("Category not found"));
        p.setName(req.getName());
        p.setDescription(req.getDescription());
        p.setPrice(req.getPrice());
        p.setStockQuantity(req.getStockQuantity() != null ? req.getStockQuantity() : 0);
        p.setImageUrl(req.getImageUrl());
        p.setCategory(cat);
        p.setActive(req.getActive() != null ? req.getActive() : true);
        if (req.getDiscountId() != null) {
            p.setDiscount(discountRepository.findById(req.getDiscountId()).orElse(null));
        } else {
            p.setDiscount(null);
        }
        p = productRepository.save(p);
        return ResponseEntity.ok(toDto(p));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    private ProductDto toDto(Product p) {
        ProductDto dto = new ProductDto();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setDescription(p.getDescription());
        dto.setPrice(p.getPrice());
        dto.setStockQuantity(p.getStockQuantity());
        dto.setImageUrl(p.getImageUrl());
        dto.setCategoryId(p.getCategory().getId());
        dto.setCategoryName(p.getCategory().getName());
        if (p.getDiscount() != null) {
            dto.setDiscountId(p.getDiscount().getId());
            dto.setDiscountPercentage(p.getDiscount().getPercentage().doubleValue());
        }
        return dto;
    }
}
