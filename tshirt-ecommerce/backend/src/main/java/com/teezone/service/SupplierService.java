package com.teezone.service;

import com.teezone.dto.SupplierRegistrationRequest;
import com.teezone.entity.Product;
import com.teezone.entity.Role;
import com.teezone.entity.Supplier;
import com.teezone.entity.User;
import com.teezone.repository.ProductRepository;
import com.teezone.repository.SupplierRepository;
import com.teezone.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final AuditLogService auditLogService;

    public SupplierService(SupplierRepository supplierRepository,
                           UserRepository userRepository,
                           ProductRepository productRepository,
                           AuditLogService auditLogService) {
        this.supplierRepository = supplierRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public Supplier registerSupplier(Long userId, SupplierRegistrationRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        // Update role to ROLE_SUPPLIER
        user.setRole(Role.ROLE_SUPPLIER);
        userRepository.save(user);

        Supplier supplier = new Supplier(
                user,
                req.getStoreName(),
                req.getPhone(),
                req.getAddressLine(),
                req.getCity(),
                req.getState(),
                req.getPincode()
        );
        supplier.setCompanyName(req.getCompanyName());
        supplier.setGstin(req.getGstin());
        supplier.setPan(req.getPan());
        supplier.setDistrict(req.getDistrict());
        supplier.setBankAccount(req.getBankAccount());
        supplier.setBankIfsc(req.getBankIfsc());
        supplier.setBankName(req.getBankName());
        supplier.setStatus("APPROVED"); // Default auto-approve for seamless onboarding demo

        Supplier saved = supplierRepository.save(supplier);

        auditLogService.log(
                userId,
                user.getEmail(),
                "SUPPLIER_ONBOARD",
                "SUPPLIER",
                saved.getId().toString(),
                null,
                "APPROVED",
                "Vendor registered store: " + req.getStoreName(),
                "127.0.0.1"
        );

        return saved;
    }

    @Transactional
    public Supplier updateSupplierStatus(Long supplierId, String status, String reason, String adminEmail, Long adminId) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found with id: " + supplierId));

        String oldStatus = supplier.getStatus();
        supplier.setStatus(status);
        Supplier saved = supplierRepository.save(supplier);

        auditLogService.log(
                adminId,
                adminEmail,
                "SUPPLIER_STATUS_UPDATE",
                "SUPPLIER",
                supplierId.toString(),
                oldStatus,
                status,
                reason,
                "127.0.0.1"
        );

        return saved;
    }

    public Optional<Supplier> getSupplierByUserId(Long userId) {
        return supplierRepository.findByUserId(userId);
    }

    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    public Map<String, Object> getSupplierDashboardMetrics(Long supplierId) {
        Map<String, Object> metrics = new HashMap<>();

        List<Product> products = productRepository.findAll(); // In full multi-vendor filtered by supplier_id
        long totalProducts = products.size();
        long lowStockCount = products.stream()
                .filter(p -> p.getSizes().stream().anyMatch(s -> s.getStock() <= 5))
                .count();

        metrics.put("todaySales", new BigDecimal("14850.00"));
        metrics.put("totalOrders", 48);
        metrics.put("pendingOrders", 6);
        metrics.put("revenue", new BigDecimal("186400.00"));
        metrics.put("lowStockProducts", lowStockCount);
        metrics.put("outOfStockProducts", 1);
        metrics.put("pendingDispatch", 4);
        metrics.put("returns", 2);
        metrics.put("settlementAmount", new BigDecimal("142500.00"));
        metrics.put("totalProducts", totalProducts);

        return metrics;
    }
}
