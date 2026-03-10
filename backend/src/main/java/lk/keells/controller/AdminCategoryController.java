package lk.keells.controller;

import jakarta.validation.Valid;
import lk.keells.dto.CategoryCreateRequest;
import lk.keells.dto.CategoryDto;
import lk.keells.entity.Category;
import lk.keells.repository.CategoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/categories")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCategoryController {

    private final CategoryRepository categoryRepository;

    public AdminCategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public ResponseEntity<List<CategoryDto>> getAll() {
        return ResponseEntity.ok(
                categoryRepository.findAll()
                        .stream()
                        .map(this::toDto)
                        .collect(Collectors.toList())
        );
    }

    @PostMapping
    public ResponseEntity<CategoryDto> create(@Valid @RequestBody CategoryCreateRequest req) {
        Category c = new Category();
        c.setName(req.getName());
        c.setDescription(req.getDescription());
        c.setImageUrl(req.getImageUrl()); // NEW
        c = categoryRepository.save(c);
        return ResponseEntity.ok(toDto(c));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryDto> update(@PathVariable Long id, @Valid @RequestBody CategoryCreateRequest req) {
        Category c = categoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));
        c.setName(req.getName());
        c.setDescription(req.getDescription());
        c.setImageUrl(req.getImageUrl()); // NEW
        c = categoryRepository.save(c);
        return ResponseEntity.ok(toDto(c));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        categoryRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    private CategoryDto toDto(Category c) {
        CategoryDto dto = new CategoryDto();
        dto.setId(c.getId());
        dto.setName(c.getName());
        dto.setDescription(c.getDescription());
        dto.setImageUrl(c.getImageUrl()); // NEW
        return dto;
    }
}