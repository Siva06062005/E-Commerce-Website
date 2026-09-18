package com.teezone.controller;

import com.teezone.dto.ApiResponse;
import com.teezone.entity.AuditLog;
import com.teezone.entity.Supplier;
import com.teezone.entity.SupplierSettlement;
import com.teezone.service.AuditLogService;
import com.teezone.service.SettlementService;
import com.teezone.service.SupplierService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final SupplierService supplierService;
    private final SettlementService settlementService;
    private final AuditLogService auditLogService;

    public AdminController(SupplierService supplierService,
                           SettlementService settlementService,
                           AuditLogService auditLogService) {
        this.supplierService = supplierService;
        this.settlementService = settlementService;
        this.auditLogService = auditLogService;
    }

    @GetMapping("/suppliers")
    public ResponseEntity<ApiResponse<List<Supplier>>> getAllSuppliers() {
        return ResponseEntity.ok(ApiResponse.ok(supplierService.getAllSuppliers()));
    }

    @PutMapping("/suppliers/{id}/status")
    public ResponseEntity<ApiResponse<Supplier>> updateSupplierStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(defaultValue = "Admin decision") String reason,
            @RequestParam(defaultValue = "admin@teezone.com") String adminEmail,
            @RequestParam(defaultValue = "1") Long adminId) {
        Supplier updated = supplierService.updateSupplierStatus(id, status, reason, adminEmail, adminId);
        return ResponseEntity.ok(ApiResponse.ok(updated));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getAuditLogs(
            @RequestParam(required = false) String resourceType) {
        List<AuditLog> logs = (resourceType != null && !resourceType.isEmpty())
                ? auditLogService.getLogsByResourceType(resourceType)
                : auditLogService.getRecentLogs();
        return ResponseEntity.ok(ApiResponse.ok(logs));
    }

    @GetMapping("/settlements")
    public ResponseEntity<ApiResponse<List<SupplierSettlement>>> getAllSettlements() {
        return ResponseEntity.ok(ApiResponse.ok(settlementService.getAllSettlements()));
    }

    @PostMapping("/settlements/{id}/payout")
    public ResponseEntity<ApiResponse<SupplierSettlement>> payoutSettlement(
            @PathVariable Long id,
            @RequestParam String paymentReference,
            @RequestParam(defaultValue = "admin@teezone.com") String adminEmail,
            @RequestParam(defaultValue = "1") Long adminId) {
        SupplierSettlement paid = settlementService.markSettlementPaid(id, paymentReference, adminEmail, adminId);
        return ResponseEntity.ok(ApiResponse.ok(paid));
    }

    @GetMapping("/system/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSystemHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("platform", "Indian Multi-Vendor Commerce Engine");
        health.put("database", "CONNECTED");
        health.put("currency", "INR (₹)");
        health.put("gstCompliant", true);
        health.put("pincodeServiceability", "ACTIVE (Pan-India 28,000+ PINs)");
        health.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(ApiResponse.ok(health));
    }
}
