package lk.keells.repository;

import lk.keells.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByActiveTrue();
    List<Product> findByCategoryIdAndActiveTrue(Long categoryId);

    // ✅ NEW
    List<Product> findByBrandIdAndActiveTrue(Long brandId);
}