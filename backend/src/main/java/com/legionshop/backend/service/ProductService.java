package com.legionshop.backend.service;

import com.legionshop.backend.dto.ProductRequest;
import com.legionshop.backend.dto.ProductResponse;
import com.legionshop.backend.dto.ProductSpecDto;
import com.legionshop.backend.dto.ProductSpecRequest;
import com.legionshop.backend.entity.Product;
import com.legionshop.backend.entity.ProductSpec;
import com.legionshop.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
/**
 * Ma nguon thuoc du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * Service xu ly nghiep vu logic cho Product.
 */
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ProductResponse> searchProducts(String keyword, Long minPrice, Long maxPrice, String sort) {
        Stream<Product> stream = productRepository.findAll().stream();
        String kw = safeTrim(keyword).toLowerCase();
        if (!kw.isBlank()) {
            stream = stream.filter(p -> safeTrim(p.getName()).toLowerCase().contains(kw)
                    || safeTrim(p.getSku()).toLowerCase().contains(kw)
                    || safeTrim(p.getDescription()).toLowerCase().contains(kw));
        }
        if (minPrice != null) stream = stream.filter(p -> (p.getPrice() == null ? 0L : p.getPrice()) >= minPrice);
        if (maxPrice != null) stream = stream.filter(p -> (p.getPrice() == null ? 0L : p.getPrice()) <= maxPrice);

        Comparator<Product> comparator = Comparator.comparing(Product::getId, Comparator.nullsLast(Long::compareTo)).reversed();
        if ("price_asc".equalsIgnoreCase(sort)) comparator = Comparator.comparing(p -> p.getPrice() == null ? 0L : p.getPrice());
        if ("price_desc".equalsIgnoreCase(sort)) comparator = Comparator.comparing((Product p) -> p.getPrice() == null ? 0L : p.getPrice()).reversed();
        if ("name_asc".equalsIgnoreCase(sort)) comparator = Comparator.comparing(p -> safeTrim(p.getName()).toLowerCase());

        return stream.sorted(comparator).map(this::toResponse).collect(Collectors.toList());
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + id));
        return toResponse(product);
    }

    @Transactional
    public ProductResponse addProduct(ProductRequest request) {
        validateProductRequest(request);
        Product product = new Product();
        applyRequest(product, request);
        Product saved = productRepository.save(product);
        return toResponse(saved);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm ID: " + id));
        validateProductRequest(request);
        applyRequest(product, request);
        Product saved = productRepository.save(product);
        return toResponse(saved);
    }

    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) throw new RuntimeException("Không tìm thấy sản phẩm cần xóa.");
        productRepository.deleteById(id);
    }

    private void validateProductRequest(ProductRequest request) {
        if (request.getName() == null || request.getName().isBlank()) throw new RuntimeException("Tên sản phẩm không được để trống.");
        if (request.getSku() == null || request.getSku().isBlank()) throw new RuntimeException("Mã sản phẩm (SKU) không được để trống.");
        if (request.getPrice() == null || request.getPrice() <= 0) throw new RuntimeException("Giá sản phẩm không hợp lệ.");
        if (request.getStockQuantity() != null && request.getStockQuantity() < 0) throw new RuntimeException("Tồn kho không được âm.");
    }

    private void applyRequest(Product product, ProductRequest request) {
        product.setName(request.getName().trim());
        product.setSku(request.getSku().trim());
        product.setPrice(request.getPrice());
        product.setOldPrice(request.getOldPrice());
        product.setDiscount(request.getDiscount());
        product.setImageUrl(request.getImageUrl());
        product.setImageUrls(joinImages(request.getImageUrls()));
        product.setStockQuantity(request.getStockQuantity() == null ? 0 : request.getStockQuantity());
        product.setDescription(request.getDescription());

        if (product.getSpecs() != null) product.getSpecs().clear();
        else product.setSpecs(new ArrayList<>());

        if (request.getSpecs() != null) {
            for (ProductSpecRequest specReq : request.getSpecs()) {
                if (safeTrim(specReq.getSpecKey()).isBlank() && safeTrim(specReq.getSpecValue()).isBlank()) continue;
                ProductSpec spec = new ProductSpec();
                spec.setSpecKey(specReq.getSpecKey());
                spec.setSpecValue(specReq.getSpecValue());
                spec.setProduct(product);
                product.getSpecs().add(spec);
            }
        }
    }

    private ProductResponse toResponse(Product product) {
        List<ProductSpecDto> specDtos = product.getSpecs() != null ? product.getSpecs().stream()
                .map(spec -> new ProductSpecDto(spec.getSpecKey(), spec.getSpecValue()))
                .collect(Collectors.toList()) : new ArrayList<>();
        return new ProductResponse(product.getId(), product.getName(), product.getSku(), product.getPrice(), product.getOldPrice(), product.getImageUrl(), splitImages(product.getImageUrls()), product.getStockQuantity(), product.getDescription(), product.getDiscount(), specDtos);
    }

    private String joinImages(List<String> images) {
        if (images == null || images.isEmpty()) return null;
        return images.stream().filter(v -> !safeTrim(v).isBlank()).collect(Collectors.joining("||"));
    }

    private List<String> splitImages(String images) {
        if (images == null || images.isBlank()) return new ArrayList<>();
        return Arrays.stream(images.split("\\|\\|", -1)).filter(v -> !v.isBlank()).collect(Collectors.toList());
    }

    private String safeTrim(String value) { return value == null ? "" : value.trim(); }
}
