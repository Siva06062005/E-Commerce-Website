package com.teezone.controller;

import com.teezone.dto.ApiResponse;
import com.teezone.dto.ProductDto;
import com.teezone.entity.Product;
import com.teezone.entity.ProductSize;
import com.teezone.repository.ProductRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(productRepository.searchProducts(search.trim()));
        }
        if (category != null && !category.trim().isEmpty()) {
            return ResponseEntity.ok(productRepository.findByCategoryIgnoreCase(category.trim()));
        }
        return ResponseEntity.ok(productRepository.findAll());
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/admin/products")
    public ResponseEntity<Product> createProductAdmin(@Valid @RequestBody ProductDto dto) {
        Product product = new Product();
        mapDtoToProduct(dto, product);
        Product saved = productRepository.save(product);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/admin/products/{id}")
    public ResponseEntity<Product> updateProductAdmin(@PathVariable Long id, @Valid @RequestBody ProductDto dto) {
        return productRepository.findById(id).map(product -> {
            mapDtoToProduct(dto, product);
            return ResponseEntity.ok(productRepository.save(product));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/admin/products/{id}")
    public ResponseEntity<Void> deleteProductAdmin(@PathVariable Long id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    private void mapDtoToProduct(ProductDto dto, Product product) {
        product.setName(dto.getName());
        product.setSlug(dto.getSlug() != null ? dto.getSlug() : dto.getName().toLowerCase().replaceAll("[^a-z0-9]+", "-"));
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setOriginalPrice(dto.getOriginalPrice());
        product.setImage(dto.getImage());
        product.setCategory(dto.getCategory());
        product.setColor(dto.getColor());
        product.setBadge(dto.getBadge());
        product.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");

        if (dto.getSizes() != null && !dto.getSizes().isEmpty()) {
            product.getSizes().clear();
            for (var sDto : dto.getSizes()) {
                product.addSize(new ProductSize(sDto.getSize(), sDto.getStock()));
            }
        }
    }
}
