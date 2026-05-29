package com.legionshop.backend.service;

import com.legionshop.backend.dto.ProductRequest;
import com.legionshop.backend.dto.ProductResponse;
import com.legionshop.backend.dto.ProductSpecDto;
import com.legionshop.backend.dto.ProductSpecRequest;
import com.legionshop.backend.entity.Product;
import com.legionshop.backend.entity.ProductSpec;
import com.legionshop.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // Lấy tất cả sản phẩm
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Lấy sản phẩm theo ID
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + id));
        return toResponse(product);
    }

    // =======================================================

    // Thêm sản phẩm mới (POST)
    public ProductResponse addProduct(ProductRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new RuntimeException("Tên sản phẩm không được để trống.");
        }
        if (request.getSku() == null || request.getSku().isBlank()) { // 🚨 Validate SKU
            throw new RuntimeException("Mã sản phẩm (SKU) không được để trống.");
        }
        if (request.getPrice() == null || request.getPrice() <= 0) {
            throw new RuntimeException("Giá sản phẩm không hợp lệ.");
        }
        // TODO: Kiểm tra SKU đã tồn tại chưa (Nếu muốn)

        Product product = new Product();
        product.setName(request.getName());
        product.setSku(request.getSku()); // 🚨 Thêm SKU
        product.setPrice(request.getPrice());
        product.setOldPrice(request.getOldPrice());
        product.setDiscount(request.getDiscount());
        product.setImageUrl(request.getImageUrl());
        product.setDescription(request.getDescription());

        // --- Xử lý Specs khi thêm mới ---
        if (request.getSpecs() != null && !request.getSpecs().isEmpty()) {
            List<ProductSpec> specs = new ArrayList<>();
            for (ProductSpecRequest specReq : request.getSpecs()) {
                ProductSpec spec = new ProductSpec();
                spec.setSpecKey(specReq.getSpecKey());
                spec.setSpecValue(specReq.getSpecValue());
                spec.setProduct(product);
                specs.add(spec);
            }
            product.setSpecs(specs);
        } else {
            product.setSpecs(new ArrayList<>());
        }

        Product saved = productRepository.save(product);
        return toResponse(saved);
    }

    // Cập nhật sản phẩm (PUT)
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm ID: " + id));

        if (request.getName() == null || request.getName().isBlank()) {
            throw new RuntimeException("Tên sản phẩm không được để trống.");
        }
        if (request.getSku() == null || request.getSku().isBlank()) { // 🚨 Validate SKU
            throw new RuntimeException("Mã sản phẩm (SKU) không được để trống.");
        }

        // Cập nhật tất cả các trường từ request
        product.setName(request.getName());
        product.setSku(request.getSku()); // 🚨 Cập nhật SKU
        product.setPrice(request.getPrice());
        product.setOldPrice(request.getOldPrice());
        product.setDiscount(request.getDiscount());
        product.setImageUrl(request.getImageUrl());
        product.setDescription(request.getDescription());

        // --- Xử lý Specs khi cập nhật (Giữ nguyên) ---
        if (product.getSpecs() != null) {
            product.getSpecs().clear();
        } else {
            product.setSpecs(new ArrayList<>());
        }

        if (request.getSpecs() != null && !request.getSpecs().isEmpty()) {
            for (ProductSpecRequest specReq : request.getSpecs()) {
                ProductSpec spec = new ProductSpec();
                spec.setSpecKey(specReq.getSpecKey());
                spec.setSpecValue(specReq.getSpecValue());
                spec.setProduct(product);
                product.getSpecs().add(spec);
            }
        }

        Product saved = productRepository.save(product);
        return toResponse(saved);
    }

    // Xóa sản phẩm (Giữ nguyên)
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy sản phẩm cần xóa.");
        }
        productRepository.deleteById(id);
    }

    // Hàm chuyển từ Entity sang DTO (Cần cập nhật ProductResponse)
    private ProductResponse toResponse(Product product) {

        List<ProductSpecDto> specDtos = product.getSpecs() != null ? product.getSpecs().stream()
                .map(spec -> new ProductSpecDto(spec.getSpecKey(), spec.getSpecValue()))
                .collect(Collectors.toList()) : new ArrayList<>();

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getSku(),
                product.getPrice(),
                product.getOldPrice(),
                product.getImageUrl(),
                product.getDescription(),
                product.getDiscount(),
                specDtos
        );
    }
}