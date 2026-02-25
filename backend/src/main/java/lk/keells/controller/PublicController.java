package lk.keells.controller;

import lk.keells.dto.CategoryDto;
import lk.keells.dto.DiscountDto;
import lk.keells.dto.ProductDto;
import lk.keells.service.CategoryService;
import lk.keells.service.DiscountService;
import lk.keells.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final ProductService productService;
    private final CategoryService categoryService;
    private final DiscountService discountService;

    public PublicController(ProductService productService, CategoryService categoryService, DiscountService discountService) {
        this.productService = productService;
        this.categoryService = categoryService;
        this.discountService = discountService;
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductDto>> getAllActiveProducts() {
        return ResponseEntity.ok(productService.getAllActiveProducts());
    }

    @GetMapping("/products/category/{categoryId}")
    public ResponseEntity<List<ProductDto>> getProductsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(productService.getProductsByCategory(categoryId));
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<ProductDto> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDto>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/discounts")
    public ResponseEntity<List<DiscountDto>> getAllActiveDiscounts() {
        return ResponseEntity.ok(discountService.getAllActiveDiscounts());
    }
}
