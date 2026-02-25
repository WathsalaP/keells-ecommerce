package lk.keells.dto;

import java.math.BigDecimal;

public class DashboardStatsDto {
    private BigDecimal monthlyRevenue;
    private BigDecimal yearlyRevenue;
    private Long monthlyOrderCount;
    private Long yearlyOrderCount;
    private Long totalUsers;
    private Long totalProducts;

    public BigDecimal getMonthlyRevenue() { return monthlyRevenue; }
    public void setMonthlyRevenue(BigDecimal monthlyRevenue) { this.monthlyRevenue = monthlyRevenue; }
    public BigDecimal getYearlyRevenue() { return yearlyRevenue; }
    public void setYearlyRevenue(BigDecimal yearlyRevenue) { this.yearlyRevenue = yearlyRevenue; }
    public Long getMonthlyOrderCount() { return monthlyOrderCount; }
    public void setMonthlyOrderCount(Long monthlyOrderCount) { this.monthlyOrderCount = monthlyOrderCount; }
    public Long getYearlyOrderCount() { return yearlyOrderCount; }
    public void setYearlyOrderCount(Long yearlyOrderCount) { this.yearlyOrderCount = yearlyOrderCount; }
    public Long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(Long totalUsers) { this.totalUsers = totalUsers; }
    public Long getTotalProducts() { return totalProducts; }
    public void setTotalProducts(Long totalProducts) { this.totalProducts = totalProducts; }
}
