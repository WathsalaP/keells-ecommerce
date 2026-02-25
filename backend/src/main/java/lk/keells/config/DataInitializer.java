package lk.keells.config;

import lk.keells.entity.Category;
import lk.keells.entity.Discount;
import lk.keells.entity.Product;
import lk.keells.entity.User;
import lk.keells.repository.CategoryRepository;
import lk.keells.repository.DiscountRepository;
import lk.keells.repository.ProductRepository;
import lk.keells.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final DiscountRepository discountRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, CategoryRepository categoryRepository, ProductRepository productRepository, DiscountRepository discountRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.discountRepository = discountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        userRepository.findByEmail("admin@keells.lk").ifPresentOrElse(
            admin -> {
                admin.setPassword(passwordEncoder.encode("KeellsAdmin#2024"));
                userRepository.save(admin);
            },
            () -> {
                User admin = new User();
                admin.setEmail("admin@keells.lk");
                admin.setPassword(passwordEncoder.encode("KeellsAdmin#2024"));
                admin.setFullName("Keells Admin");
                admin.setRole(User.Role.ADMIN);
                admin.setActive(true);
                userRepository.save(admin);
            }
        );

        if (categoryRepository.count() == 0) {
            Category groceries = new Category();
            groceries.setName("Groceries");
            groceries.setDescription("Fresh produce and daily essentials");
            categoryRepository.save(groceries);

            Category dairy = new Category();
            dairy.setName("Dairy & Eggs");
            dairy.setDescription("Milk, cheese, eggs and more");
            categoryRepository.save(dairy);

            Category beverages = new Category();
            beverages.setName("Beverages");
            beverages.setDescription("Drinks and refreshments");
            categoryRepository.save(beverages);
        }

        if (discountRepository.count() == 0) {
            Discount d1 = new Discount();
            d1.setName("Weekly Special");
            d1.setPercentage(BigDecimal.valueOf(10));
            d1.setActive(true);
            discountRepository.save(d1);

            Discount d2 = new Discount();
            d2.setName("New Year Sale");
            d2.setPercentage(BigDecimal.valueOf(20));
            d2.setActive(true);
            discountRepository.save(d2);
        }

        if (productRepository.count() == 0) {
            var cats = categoryRepository.findAll();
            var discounts = discountRepository.findAll();
            Category g = cats.get(0);
            Category d = cats.get(1);
            Category b = cats.get(2);

            createProduct("Fresh Milk 1L", "Full cream fresh milk", new BigDecimal("280"), 50, g, discounts.get(0));
            createProduct("White Bread", "Soft white bread loaf", new BigDecimal("180"), 100, g, null);
            createProduct("Eggs (6pcs)", "Farm fresh eggs", new BigDecimal("350"), 80, d, null);
            createProduct("Cheese 200g", "Cheddar cheese block", new BigDecimal("650"), 30, d, discounts.get(1));
            createProduct("Mineral Water 1.5L", "Pure drinking water", new BigDecimal("120"), 200, b, null);
            createProduct("Orange Juice 1L", "Fresh orange juice", new BigDecimal("450"), 40, b, discounts.get(0));
        }
    }

    private void createProduct(String name, String desc, BigDecimal price, int stock, Category cat, Discount disc) {
        Product p = new Product();
        p.setName(name);
        p.setDescription(desc);
        p.setPrice(price);
        p.setStockQuantity(stock);
        p.setCategory(cat);
        p.setDiscount(disc);
        productRepository.save(p);
    }
}
