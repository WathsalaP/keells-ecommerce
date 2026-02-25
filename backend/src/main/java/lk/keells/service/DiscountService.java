package lk.keells.service;

import lk.keells.dto.DiscountDto;
import lk.keells.entity.Discount;
import lk.keells.repository.DiscountRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DiscountService {

    private final DiscountRepository discountRepository;

    public DiscountService(DiscountRepository discountRepository) {
        this.discountRepository = discountRepository;
    }

    public List<DiscountDto> getAllActiveDiscounts() {
        return discountRepository.findByActiveTrue().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
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
}
