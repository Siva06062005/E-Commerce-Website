package com.teezone.service;

import com.teezone.entity.Supplier;
import com.teezone.entity.SupplierSettlement;
import com.teezone.entity.SupplierSettlement.SettlementStatus;
import com.teezone.repository.SupplierRepository;
import com.teezone.repository.SupplierSettlementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class SettlementService {

    private final SupplierSettlementRepository settlementRepository;
    private final SupplierRepository supplierRepository;
    private final AuditLogService auditLogService;

    public SettlementService(SupplierSettlementRepository settlementRepository,
                             SupplierRepository supplierRepository,
                             AuditLogService auditLogService) {
        this.settlementRepository = settlementRepository;
        this.supplierRepository = supplierRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public SupplierSettlement generateSettlement(Long supplierId, BigDecimal grossSales, BigDecimal refundDeductions, BigDecimal taxDeductions, String actorEmail, Long actorId) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found with id: " + supplierId));

        BigDecimal commissionRate = supplier.getCommissionRate() != null ? supplier.getCommissionRate() : new BigDecimal("10.00");
        BigDecimal commissionAmount = grossSales.multiply(commissionRate)
                .divide(new BigDecimal("100.00"), 2, RoundingMode.HALF_UP);

        BigDecimal netSettlement = grossSales.subtract(commissionAmount)
                .subtract(refundDeductions != null ? refundDeductions : BigDecimal.ZERO)
                .subtract(taxDeductions != null ? taxDeductions : BigDecimal.ZERO);

        SupplierSettlement settlement = new SupplierSettlement();
        settlement.setSupplier(supplier);
        settlement.setSettlementNumber("SET-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        settlement.setGrossSales(grossSales);
        settlement.setCommissionRate(commissionRate);
        settlement.setCommissionAmount(commissionAmount);
        settlement.setRefundDeductions(refundDeductions != null ? refundDeductions : BigDecimal.ZERO);
        settlement.setTaxDeductions(taxDeductions != null ? taxDeductions : BigDecimal.ZERO);
        settlement.setNetSettlement(netSettlement);
        settlement.setStatus(SettlementStatus.PENDING);
        settlement.setPeriodStart(LocalDateTime.now().minusDays(14));
        settlement.setPeriodEnd(LocalDateTime.now());

        SupplierSettlement saved = settlementRepository.save(settlement);

        auditLogService.log(
                actorId,
                actorEmail,
                "SETTLEMENT_GENERATE",
                "SETTLEMENT",
                saved.getSettlementNumber(),
                null,
                netSettlement.toString(),
                "Generated settlement for supplier: " + supplier.getStoreName(),
                "127.0.0.1"
        );

        return saved;
    }

    @Transactional
    public SupplierSettlement markSettlementPaid(Long settlementId, String paymentReference, String actorEmail, Long actorId) {
        SupplierSettlement settlement = settlementRepository.findById(settlementId)
                .orElseThrow(() -> new IllegalArgumentException("Settlement not found with id: " + settlementId));

        settlement.setStatus(SettlementStatus.PAID);
        settlement.setPaymentReference(paymentReference);
        settlement.setPayoutDate(LocalDateTime.now());

        SupplierSettlement saved = settlementRepository.save(settlement);

        auditLogService.log(
                actorId,
                actorEmail,
                "SETTLEMENT_PAY",
                "SETTLEMENT",
                saved.getSettlementNumber(),
                "PENDING",
                "PAID",
                "Disbursed settlement payout with reference: " + paymentReference,
                "127.0.0.1"
        );

        return saved;
    }

    public List<SupplierSettlement> getSettlementsForSupplier(Long supplierId) {
        return settlementRepository.findBySupplierIdOrderByCreatedAtDesc(supplierId);
    }

    public List<SupplierSettlement> getAllSettlements() {
        return settlementRepository.findAllByOrderByCreatedAtDesc();
    }
}
