package com.teezone.repository;

import com.teezone.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    Optional<Supplier> findByUserId(Long userId);
    List<Supplier> findByStatus(String status);
    Boolean existsByGstin(String gstin);
}
