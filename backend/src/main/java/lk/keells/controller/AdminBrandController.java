package lk.keells.controller;

import jakarta.validation.Valid;
import lk.keells.dto.BrandDto;
import lk.keells.service.BrandService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/brands")
@PreAuthorize("hasRole('ADMIN')")
public class AdminBrandController {

    private final BrandService brandService;

    public AdminBrandController(BrandService brandService) {
        this.brandService = brandService;
    }

    @GetMapping
    public ResponseEntity<List<BrandDto>> all() {
        return ResponseEntity.ok(brandService.getAllBrands());
    }

    @PostMapping
    public ResponseEntity<BrandDto> create(@Valid @RequestBody BrandDto req) {
        return ResponseEntity.ok(brandService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BrandDto> update(@PathVariable Long id, @Valid @RequestBody BrandDto req) {
        return ResponseEntity.ok(brandService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        brandService.delete(id);
        return ResponseEntity.ok().build();
    }
}