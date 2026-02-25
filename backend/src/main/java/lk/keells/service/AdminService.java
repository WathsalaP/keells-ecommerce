package lk.keells.service;

import lk.keells.dto.DashboardStatsDto;
import lk.keells.repository.OrderRepository;
import lk.keells.repository.ProductRepository;
import lk.keells.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class AdminService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public AdminService(OrderRepository orderRepository, UserRepository userRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    public DashboardStatsDto getDashboardStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime yearStart = LocalDate.now().withDayOfYear(1).atStartOfDay();

        BigDecimal monthlyRevenue = orderRepository.sumTotalAmountByDateRange(monthStart, now);
        BigDecimal yearlyRevenue = orderRepository.sumTotalAmountByDateRange(yearStart, now);
        Long monthlyOrders = orderRepository.countOrdersByDateRange(monthStart, now);
        Long yearlyOrders = orderRepository.countOrdersByDateRange(yearStart, now);
        Long totalUsers = userRepository.count();
        Long totalProducts = productRepository.count();

        DashboardStatsDto dto = new DashboardStatsDto();
        dto.setMonthlyRevenue(monthlyRevenue != null ? monthlyRevenue : BigDecimal.ZERO);
        dto.setYearlyRevenue(yearlyRevenue != null ? yearlyRevenue : BigDecimal.ZERO);
        dto.setMonthlyOrderCount(monthlyOrders != null ? monthlyOrders : 0L);
        dto.setYearlyOrderCount(yearlyOrders != null ? yearlyOrders : 0L);
        dto.setTotalUsers(totalUsers);
        dto.setTotalProducts(totalProducts);
        return dto;
    }
}
