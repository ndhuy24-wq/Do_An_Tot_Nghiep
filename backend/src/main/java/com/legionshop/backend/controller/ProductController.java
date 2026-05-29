package com.legionshop.backend.controller;

import com.legionshop.backend.dto.ProductRequest;
import com.legionshop.backend.dto.ProductResponse;
import com.legionshop.backend.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {
    private final ProductService productService;
    public ProductController(ProductService productService) { this.productService = productService; }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "minPrice", required = false) Long minPrice,
            @RequestParam(value = "maxPrice", required = false) Long maxPrice,
            @RequestParam(value = "sort", required = false) String sort) {
        boolean hasFilter = keyword != null || minPrice != null || maxPrice != null || sort != null;
        return ResponseEntity.ok(hasFilter ? productService.searchProducts(keyword, minPrice, maxPrice, sort) : productService.getAllProducts());
    }

    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try { return ResponseEntity.ok(Map.of("imageUrl", saveImage(file))); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("message", "Upload ảnh thất bại: " + e.getMessage())); }
    }

    @PostMapping("/upload-images")
    public ResponseEntity<?> uploadImages(@RequestParam("files") MultipartFile[] files) {
        try {
            if (files == null || files.length == 0) return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng chọn ảnh."));
            List<String> urls = new ArrayList<>();
            for (MultipartFile file : files) urls.add(saveImage(file));
            return ResponseEntity.ok(Map.of("imageUrls", urls));
        } catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("message", "Upload ảnh thất bại: " + e.getMessage())); }
    }

    private String saveImage(MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) throw new RuntimeException("Vui lòng chọn ảnh.");
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        if (!contentType.startsWith("image/")) throw new RuntimeException("File tải lên phải là ảnh.");
        if (file.getSize() > 5 * 1024 * 1024) throw new RuntimeException("Ảnh không được vượt quá 5MB.");
        String originalName = file.getOriginalFilename() == null ? "image" : file.getOriginalFilename();
        String ext = ""; int dotIndex = originalName.lastIndexOf('.');
        if (dotIndex >= 0) ext = originalName.substring(dotIndex).replaceAll("[^a-zA-Z0-9.]", "");
        Path uploadDir = Paths.get("uploads", "products"); Files.createDirectories(uploadDir);
        String fileName = UUID.randomUUID() + ext;
        Path target = uploadDir.resolve(fileName); file.transferTo(target.toFile());
        return "/uploads/products/" + fileName;
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        try { return ResponseEntity.ok(productService.getProductById(id)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
    }

    @PostMapping
    public ResponseEntity<?> addProduct(@RequestBody ProductRequest request) {
        try { return ResponseEntity.ok(productService.addProduct(request)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody ProductRequest request) {
        try { return ResponseEntity.ok(productService.updateProduct(id, request)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try { productService.deleteProduct(id); return ResponseEntity.ok(Map.of("message", "Xóa sản phẩm thành công")); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
    }
}
