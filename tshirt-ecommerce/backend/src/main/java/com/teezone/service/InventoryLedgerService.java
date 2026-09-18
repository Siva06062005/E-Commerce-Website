package com.teezone.service;

import com.teezone.dto.InventoryAdjustmentRequest;
import com.teezone.entity.InventoryTransaction;
import com.teezone.entity.Product;
import com.teezone.entity.ProductSize;
import com.teezone.repository.InventoryTransactionRepository;
import com.teezone.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InventoryLedgerService {

    private final ProductRepository productRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final AuditLogService auditLogService;

    public InventoryLedgerService(ProductRepository productRepository,
                                  InventoryTransactionRepository transactionRepository,
                                  AuditLogService auditLogService) {
        this.productRepository = productRepository;
        this.transactionRepository = transactionRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public InventoryTransaction recordTransaction(InventoryAdjustmentRequest request, String actorEmail, Long actorId) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + request.getProductId()));

        ProductSize sizeToAdjust = product.getSizes().stream()
                .filter(s -> s.getSize().equalsIgnoreCase(request.getSizeName()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Size '" + request.getSizeName() + "' not found for product id: " + request.getProductId()));

        int oldStock = sizeToAdjust.getStock();
        int newStock = oldStock + request.getQuantity();

        if (newStock < 0) {
            throw new IllegalStateException("Insufficient stock! Cannot reduce stock below 0. Current: " + oldStock + ", Requested delta: " + request.getQuantity());
        }

        // Update current stock level
        sizeToAdjust.setStock(newStock);
        productRepository.save(product);

        // Record immutable ledger entry
        InventoryTransaction tx = new InventoryTransaction(
                product.getId(),
                request.getVariantId(),
                sizeToAdjust.getSize(),
                request.getTransactionType(),
                request.getQuantity(),
                newStock,
                request.getReferenceType(),
                request.getReferenceId(),
                request.getReason(),
                actorEmail
        );
        InventoryTransaction savedTx = transactionRepository.save(tx);

        // Record audit log for security/administrative tracing
        auditLogService.log(
                actorId,
                actorEmail,
                "INVENTORY_ADJUST",
                "PRODUCT_SIZE",
                product.getId() + ":" + sizeToAdjust.getSize(),
                String.valueOf(oldStock),
                String.valueOf(newStock),
                request.getReason() + " (" + request.getTransactionType() + ")",
                "127.0.0.1"
        );

        return savedTx;
    }

    public List<InventoryTransaction> getTransactionsForProduct(Long productId) {
        return transactionRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    public List<InventoryTransaction> getAllTransactions() {
        return transactionRepository.findAllByOrderByCreatedAtDesc();
    }
}
