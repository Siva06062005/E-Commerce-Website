package com.teezone.controller;

import com.teezone.dto.ApiResponse;
import com.teezone.dto.InventoryAdjustmentRequest;
import com.teezone.dto.ProductDto;
import com.teezone.dto.SupplierRegistrationRequest;
import com.teezone.entity.InventoryTransaction;
import com.teezone.entity.Product;
import com.teezone.entity.ProductSize;
import com.teezone.entity.Supplier;
import com.teezone.entity.SupplierSettlement;
import com.teezone.repository.ProductRepository;
import com.teezone.service.InventoryLedgerService;
import com.teezone.service.SettlementService;
import com.teezone.service.SupplierService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/supplier")
@CrossOrigin(origins = "*")
public class SupplierController {

    private final SupplierService supplierService;
    private final InventoryLedgerService inventoryLedgerService;
    private final SettlementService settlementService;
    private final ProductRepository productRepository;

    public SupplierController(SupplierService supplierService,
                              InventoryLedgerService inventoryLedgerService,
                              SettlementService settlementService,
                              ProductRepository productRepository) {
        this.supplierService = supplierService;
        this.inventoryLedgerService = inventoryLedgerService;
        this.settlementService = settlementService;
        this.productRepository = productRepository;
    }

    @PostMapping("/onboard")
    public ResponseEntity<ApiResponse<Supplier>> onboardSupplier(
            @RequestParam(defaultValue = "1") Long userId,
            @Valid @RequestBody SupplierRegistrationRequest request) {
        Supplier supplier = supplierService.registerSupplier(userId, request);
        return ResponseEntity.ok(ApiResponse.ok(supplier));
    }

    @GetMapping("/metrics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMetrics(
            @RequestParam(defaultValue = "1") Long supplierId) {
        Map<String, Object> metrics = supplierService.getSupplierDashboardMetrics(supplierId);
        return ResponseEntity.ok(ApiResponse.ok(metrics));
    }

    @PostMapping("/products")
    public ResponseEntity<ApiResponse<Product>> createProduct(@Valid @RequestBody ProductDto dto) {
        Product product = new Product();
        product.setName(dto.getName());
        product.setSlug(dto.getSlug() != null ? dto.getSlug() : dto.getName().toLowerCase().replaceAll("[^a-z0-9]+", "-"));
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setOriginalPrice(dto.getOriginalPrice());
        product.setImage(dto.getImage());
        product.setCategory(dto.getCategory());
        product.setColor(dto.getColor());
        product.setBadge(dto.getBadge());
        product.setStatus("ACTIVE");
        product.setApprovalStatus("APPROVED"); // Auto-approved for verified vendors

        if (dto.getSizes() != null) {
            for (var sDto : dto.getSizes()) {
                product.addSize(new ProductSize(sDto.getSize(), sDto.getStock()));
            }
        }

        Product saved = productRepository.save(product);
        return ResponseEntity.ok(ApiResponse.ok(saved));
    }

    @PostMapping("/inventory/adjust")
    public ResponseEntity<ApiResponse<InventoryTransaction>> adjustInventory(
            @Valid @RequestBody InventoryAdjustmentRequest request,
            @RequestParam(defaultValue = "vendor@teezone.in") String actorEmail,
            @RequestParam(defaultValue = "2") Long actorId) {
        InventoryTransaction tx = inventoryLedgerService.recordTransaction(request, actorEmail, actorId);
        return ResponseEntity.ok(ApiResponse.ok(tx));
    }

    @GetMapping("/inventory/transactions")
    public ResponseEntity<ApiResponse<List<InventoryTransaction>>> getTransactions(
            @RequestParam(required = false) Long productId) {
        List<InventoryTransaction> list = (productId != null)
                ? inventoryLedgerService.getTransactionsForProduct(productId)
                : inventoryLedgerService.getAllTransactions();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/settlements")
    public ResponseEntity<ApiResponse<List<SupplierSettlement>>> getSettlements(
            @RequestParam(defaultValue = "1") Long supplierId) {
        List<SupplierSettlement> settlements = settlementService.getSettlementsForSupplier(supplierId);
        return ResponseEntity.ok(ApiResponse.ok(settlements));
    }
}
