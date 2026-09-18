package com.teezone.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "supplier_settlements")
public class SupplierSettlement {

    public enum SettlementStatus {
        PENDING,
        PROCESSING,
        PAID,
        CANCELLED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Column(name = "settlement_number", unique = true, nullable = false)
    private String settlementNumber;

    @Column(name = "gross_sales", nullable = false, precision = 12, scale = 2)
    private BigDecimal grossSales;

    @Column(name = "commission_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal commissionRate;

    @Column(name = "commission_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal commissionAmount;

    @Column(name = "refund_deductions", precision = 12, scale = 2)
    private BigDecimal refundDeductions = BigDecimal.ZERO;

    @Column(name = "tax_deductions", precision = 12, scale = 2)
    private BigDecimal taxDeductions = BigDecimal.ZERO;

    @Column(name = "net_settlement", nullable = false, precision = 12, scale = 2)
    private BigDecimal netSettlement;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SettlementStatus status = SettlementStatus.PENDING;

    @Column(name = "payment_reference")
    private String paymentReference;

    @Column(name = "payout_date")
    private LocalDateTime payoutDate;

    @Column(name = "period_start")
    private LocalDateTime periodStart;

    @Column(name = "period_end")
    private LocalDateTime periodEnd;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public SupplierSettlement() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) { this.supplier = supplier; }

    public String getSettlementNumber() { return settlementNumber; }
    public void setSettlementNumber(String settlementNumber) { this.settlementNumber = settlementNumber; }

    public BigDecimal getGrossSales() { return grossSales; }
    public void setGrossSales(BigDecimal grossSales) { this.grossSales = grossSales; }

    public BigDecimal getCommissionRate() { return commissionRate; }
    public void setCommissionRate(BigDecimal commissionRate) { this.commissionRate = commissionRate; }

    public BigDecimal getCommissionAmount() { return commissionAmount; }
    public void setCommissionAmount(BigDecimal commissionAmount) { this.commissionAmount = commissionAmount; }

    public BigDecimal getRefundDeductions() { return refundDeductions; }
    public void setRefundDeductions(BigDecimal refundDeductions) { this.refundDeductions = refundDeductions; }

    public BigDecimal getTaxDeductions() { return taxDeductions; }
    public void setTaxDeductions(BigDecimal taxDeductions) { this.taxDeductions = taxDeductions; }

    public BigDecimal getNetSettlement() { return netSettlement; }
    public void setNetSettlement(BigDecimal netSettlement) { this.netSettlement = netSettlement; }

    public SettlementStatus getStatus() { return status; }
    public void setStatus(SettlementStatus status) { this.status = status; }

    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }

    public LocalDateTime getPayoutDate() { return payoutDate; }
    public void setPayoutDate(LocalDateTime payoutDate) { this.payoutDate = payoutDate; }

    public LocalDateTime getPeriodStart() { return periodStart; }
    public void setPeriodStart(LocalDateTime periodStart) { this.periodStart = periodStart; }

    public LocalDateTime getPeriodEnd() { return periodEnd; }
    public void setPeriodEnd(LocalDateTime periodEnd) { this.periodEnd = periodEnd; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
