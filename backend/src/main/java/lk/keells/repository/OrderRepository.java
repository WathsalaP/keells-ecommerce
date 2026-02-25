package lk.keells.repository;

import lk.keells.entity.Order;
import lk.keells.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserOrderByOrderDateDesc(User user);
    List<Order> findByUserOrderByOrderDateDesc(User user, org.springframework.data.domain.Pageable pageable);
    Optional<Order> findByOrderNumber(String orderNumber);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.paymentCompleted = true AND o.orderDate >= :start AND o.orderDate < :end")
    BigDecimal sumTotalAmountByDateRange(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.paymentCompleted = true AND o.orderDate >= :start AND o.orderDate < :end")
    Long countOrdersByDateRange(LocalDateTime start, LocalDateTime end);
}
