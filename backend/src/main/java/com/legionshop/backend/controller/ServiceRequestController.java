package com.legionshop.backend.controller;

import com.legionshop.backend.dto.CreateServiceRequest;
import com.legionshop.backend.dto.ServiceRequestResponse;
import com.legionshop.backend.dto.UpdateServiceRequest;
import com.legionshop.backend.service.ServiceRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/service-requests")
@CrossOrigin(origins = "*")
/**
 * Ma nguon thuoc du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * Controller dinh nghia cac API endpoint lien quan den ServiceRequest.
 */
public class ServiceRequestController {

    private final ServiceRequestService serviceRequestService;

    public ServiceRequestController(ServiceRequestService serviceRequestService) {
        this.serviceRequestService = serviceRequestService;
    }

    @PostMapping
    public ResponseEntity<ServiceRequestResponse> create(@RequestBody CreateServiceRequest request) {
        return ResponseEntity.ok(serviceRequestService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<ServiceRequestResponse>> getAll(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(serviceRequestService.getAll(email, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceRequestResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(serviceRequestService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceRequestResponse> update(
            @PathVariable Long id,
            @RequestBody UpdateServiceRequest request
    ) {
        return ResponseEntity.ok(serviceRequestService.update(id, request));
    }
}