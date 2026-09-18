package com.teezone.repository;

import com.teezone.entity.SupplierSettlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierSettlementRepository extends JpaRepository<SupplierSettlement, Long> {
    List<SupplierSettlement> findBySupplierIdOrderByCreatedAtDesc(Long supplierId);
    List<SupplierSettlement> findAllByOrderByCreatedAtDesc();
}
