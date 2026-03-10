package lk.keells.service;

import lk.keells.dto.BrandDto;
import lk.keells.entity.Brand;
import lk.keells.repository.BrandRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BrandService {

    private final BrandRepository brandRepository;

    public BrandService(BrandRepository brandRepository) {
        this.brandRepository = brandRepository;
    }

    public List<BrandDto> getAllBrands() {
        return brandRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public BrandDto create(BrandDto req) {
        Brand b = new Brand();
        b.setName(req.getName());
        b.setDescription(req.getDescription());
        b.setLogoUrl(req.getLogoUrl());
        return toDto(brandRepository.save(b));
    }

    public BrandDto update(Long id, BrandDto req) {
        Brand b = brandRepository.findById(id).orElseThrow(() -> new RuntimeException("Brand not found"));
        b.setName(req.getName());
        b.setDescription(req.getDescription());
        b.setLogoUrl(req.getLogoUrl());
        return toDto(brandRepository.save(b));
    }

    public void delete(Long id) {
        brandRepository.deleteById(id);
    }

    private BrandDto toDto(Brand b) {
        BrandDto dto = new BrandDto();
        dto.setId(b.getId());
        dto.setName(b.getName());
        dto.setDescription(b.getDescription());
        dto.setLogoUrl(b.getLogoUrl());
        return dto;
    }
}