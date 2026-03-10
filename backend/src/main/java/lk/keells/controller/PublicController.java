package lk.keells.controller;

import lk.keells.dto.BrandDto;
import lk.keells.dto.CategoryDto;
import lk.keells.dto.DiscountDto;
import lk.keells.dto.ProductDto;
import lk.keells.service.BrandService;
import lk.keells.service.CategoryService;
import lk.keells.service.DiscountService;
import lk.keells.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final ProductService productService;
    private final CategoryService categoryService;
    private final DiscountService discountService;
    private final BrandService brandService;

    public PublicController(ProductService productService,
                            CategoryService categoryService,
                            DiscountService discountService,
                            BrandService brandService) {
        this.productService = productService;
        this.categoryService = categoryService;
        this.discountService = discountService;
        this.brandService = brandService;
    }

    // ✅ Support: /public/products?brandId=1
    @GetMapping("/products")
    public ResponseEntity<List<ProductDto>> getAllActiveProducts(
            @RequestParam(value = "brandId", required = false) Long brandId
    ) {
        if (brandId != null) {
            return ResponseEntity.ok(productService.getProductsByBrand(brandId));
        }
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

    // ✅ Brands for Home page
    @GetMapping("/brands")
    public ResponseEntity<List<BrandDto>> getAllBrands() {
        return ResponseEntity.ok(brandService.getAllBrands());
    }
}