package com.legionshop.backend.repository;

import com.legionshop.backend.entity.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {

    List<ServiceRequest> findByUserEmailOrderByCreatedAtDesc(String userEmail);

    List<ServiceRequest> findByStatusOrderByCreatedAtDesc(String status);

    List<ServiceRequest> findAllByOrderByCreatedAtDesc();

    Optional<ServiceRequest> findTopByOrderByIdDesc();
}