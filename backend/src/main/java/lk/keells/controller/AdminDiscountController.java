package lk.keells.controller;

import lk.keells.dto.DiscountDto;
import lk.keells.entity.Discount;
import lk.keells.repository.DiscountRepository;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/discounts")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDiscountController {

    private final DiscountRepository discountRepository;

    public AdminDiscountController(DiscountRepository discountRepository) {
        this.discountRepository = discountRepository;
    }

    @GetMapping
    public ResponseEntity<List<DiscountDto>> getAll() {
        return ResponseEntity.ok(discountRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<DiscountDto> create(@RequestBody DiscountRequest req) {
        Discount d = new Discount();
        d.setName(req.getName());
        d.setPercentage(req.getPercentage());
        d.setValidFrom(req.getValidFrom());
        d.setValidTo(req.getValidTo());
        d.setActive(req.getActive() != null ? req.getActive() : true);
        d = discountRepository.save(d);
        return ResponseEntity.ok(toDto(d));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DiscountDto> update(@PathVariable Long id, @RequestBody DiscountRequest req) {
        Discount d = discountRepository.findById(id).orElseThrow(() -> new RuntimeException("Discount not found"));
        d.setName(req.getName());
        d.setPercentage(req.getPercentage());
        d.setValidFrom(req.getValidFrom());
        d.setValidTo(req.getValidTo());
        if (req.getActive() != null) d.setActive(req.getActive());
        d = discountRepository.save(d);
        return ResponseEntity.ok(toDto(d));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        discountRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    private DiscountDto toDto(Discount d) {
        DiscountDto dto = new DiscountDto();
        dto.setId(d.getId());
        dto.setName(d.getName());
        dto.setPercentage(d.getPercentage());
        dto.setValidFrom(d.getValidFrom());
        dto.setValidTo(d.getValidTo());
        dto.setActive(d.isActive());
        return dto;
    }

    public static class DiscountRequest {
        private String name;
        private BigDecimal percentage;
        private LocalDateTime validFrom;
        private LocalDateTime validTo;
        private Boolean active;
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public BigDecimal getPercentage() { return percentage; }
        public void setPercentage(BigDecimal percentage) { this.percentage = percentage; }
        public LocalDateTime getValidFrom() { return validFrom; }
        public void setValidFrom(LocalDateTime validFrom) { this.validFrom = validFrom; }
        public LocalDateTime getValidTo() { return validTo; }
        public void setValidTo(LocalDateTime validTo) { this.validTo = validTo; }
        public Boolean getActive() { return active; }
        public void setActive(Boolean active) { this.active = active; }
    }
}
