package com.legionshop.backend.service;

import com.legionshop.backend.dto.CreateServiceRequest;
import com.legionshop.backend.dto.ServiceRequestResponse;
import com.legionshop.backend.dto.UpdateServiceRequest;
import com.legionshop.backend.entity.ServiceRequest;
import com.legionshop.backend.entity.User;
import com.legionshop.backend.repository.ServiceRequestRepository;
import com.legionshop.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
/**
 * Ma nguon thuoc du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * Service xu ly nghiep vu logic cho Request.
 */
public class ServiceRequestService {

    private final ServiceRequestRepository serviceRequestRepository;
    private final UserRepository userRepository;

    public ServiceRequestService(ServiceRequestRepository serviceRequestRepository,
                                 UserRepository userRepository) {
        this.serviceRequestRepository = serviceRequestRepository;
        this.userRepository = userRepository;
    }

    public ServiceRequestResponse create(CreateServiceRequest request) {
        validateCreateRequest(request);

        ServiceRequest serviceRequest = new ServiceRequest();
        serviceRequest.setCode(generateCode());
        serviceRequest.setUserEmail(trimToNull(request.getUserEmail()));
        serviceRequest.setCustomerName(request.getCustomerName().trim());
        serviceRequest.setCustomerPhone(request.getCustomerPhone().trim());
        serviceRequest.setDeviceName(request.getDeviceName().trim());
        serviceRequest.setBrand(trimToNull(request.getBrand()));
        serviceRequest.setServiceType(request.getServiceType().trim().toLowerCase());
        serviceRequest.setIssueDescription(request.getIssueDescription().trim());
        serviceRequest.setDeviceCondition(trimToNull(request.getDeviceCondition()));
        serviceRequest.setAppointmentDate(request.getAppointmentDate());
        serviceRequest.setStatus("received");
        serviceRequest.setEstimatedCost(0L);

        if (serviceRequest.getUserEmail() != null) {
            Optional<User> userOptional = userRepository.findByEmail(serviceRequest.getUserEmail());
            userOptional.ifPresent(serviceRequest::setUser);
        }

        ServiceRequest saved = serviceRequestRepository.save(serviceRequest);
        return toResponse(saved);
    }

    public List<ServiceRequestResponse> getAll(String email, String status) {
        List<ServiceRequest> list;

        if (email != null && !email.isBlank()) {
            list = serviceRequestRepository.findByUserEmailOrderByCreatedAtDesc(email.trim());
        } else if (status != null && !status.isBlank()) {
            list = serviceRequestRepository.findByStatusOrderByCreatedAtDesc(status.trim().toLowerCase());
        } else {
            list = serviceRequestRepository.findAllByOrderByCreatedAtDesc();
        }

        return list.stream().map(this::toResponse).toList();
    }

    public ServiceRequestResponse getById(Long id) {
        ServiceRequest serviceRequest = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu dịch vụ"));

        return toResponse(serviceRequest);
    }

    public ServiceRequestResponse update(Long id, UpdateServiceRequest request) {
        ServiceRequest serviceRequest = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu dịch vụ"));

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            serviceRequest.setStatus(request.getStatus().trim().toLowerCase());
        }

        if (request.getEstimatedCost() != null) {
            serviceRequest.setEstimatedCost(request.getEstimatedCost());
        }

        if (request.getTechnicianNote() != null) {
            serviceRequest.setTechnicianNote(trimToNull(request.getTechnicianNote()));
        }

        ServiceRequest updated = serviceRequestRepository.save(serviceRequest);
        return toResponse(updated);
    }

    private void validateCreateRequest(CreateServiceRequest request) {
        if (request.getCustomerName() == null || request.getCustomerName().isBlank()) {
            throw new RuntimeException("Tên khách hàng không được để trống");
        }
        if (request.getCustomerPhone() == null || request.getCustomerPhone().isBlank()) {
            throw new RuntimeException("Số điện thoại không được để trống");
        }
        if (request.getDeviceName() == null || request.getDeviceName().isBlank()) {
            throw new RuntimeException("Tên thiết bị không được để trống");
        }
        if (request.getServiceType() == null || request.getServiceType().isBlank()) {
            throw new RuntimeException("Loại dịch vụ không được để trống");
        }
        if (request.getIssueDescription() == null || request.getIssueDescription().isBlank()) {
            throw new RuntimeException("Mô tả lỗi không được để trống");
        }
    }

    private String generateCode() {
        Optional<ServiceRequest> latest = serviceRequestRepository.findTopByOrderByIdDesc();
        long nextNumber = latest.map(item -> item.getId() + 1).orElse(1L);
        return "DV" + String.format("%05d", nextNumber);
    }

    private ServiceRequestResponse toResponse(ServiceRequest entity) {
        ServiceRequestResponse response = new ServiceRequestResponse();
        response.setId(entity.getId());
        response.setCode(entity.getCode());
        response.setUserId(entity.getUser() != null ? entity.getUser().getId() : null);
        response.setUserEmail(entity.getUserEmail());
        response.setCustomerName(entity.getCustomerName());
        response.setCustomerPhone(entity.getCustomerPhone());
        response.setDeviceName(entity.getDeviceName());
        response.setBrand(entity.getBrand());
        response.setServiceType(entity.getServiceType());
        response.setIssueDescription(entity.getIssueDescription());
        response.setDeviceCondition(entity.getDeviceCondition());
        response.setEstimatedCost(entity.getEstimatedCost());
        response.setTechnicianNote(entity.getTechnicianNote());
        response.setStatus(entity.getStatus());
        response.setAppointmentDate(entity.getAppointmentDate());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        return response;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
