package com.teezone.service;

import com.teezone.entity.AuditLog;
import com.teezone.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public AuditLog log(Long userId, String userEmail, String action, String resourceType, String resourceId, String oldValue, String newValue, String reason, String ipAddress) {
        AuditLog audit = new AuditLog(userId, userEmail, action, resourceType, resourceId, oldValue, newValue, reason, ipAddress);
        return auditLogRepository.save(audit);
    }

    public List<AuditLog> getRecentLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<AuditLog> getLogsByResourceType(String resourceType) {
        return auditLogRepository.findByResourceTypeOrderByCreatedAtDesc(resourceType);
    }
}
