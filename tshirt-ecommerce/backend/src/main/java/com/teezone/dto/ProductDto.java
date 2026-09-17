package com.teezone.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ProductDto {
    private Long id;

    @NotBlank(message = "Product name is required")
    private String name;

    private String slug;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than zero")
    private BigDecimal price;

    private BigDecimal originalPrice;

    @NotBlank(message = "Image URL is required")
    private String image;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Color is required")
    private String color;

    private String badge;
    private String status = "ACTIVE";
    private Double rating = 4.9;
    private Integer reviewCount = 0;
    private Integer totalStock = 0;
    private List<ProductSizeDto> sizes = new ArrayList<>();

    public ProductDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BigDecimal getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(BigDecimal originalPrice) { this.originalPrice = originalPrice; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getBadge() { return badge; }
    public void setBadge(String badge) { this.badge = badge; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }

    public Integer getTotalStock() { return totalStock; }
    public void setTotalStock(Integer totalStock) { this.totalStock = totalStock; }

    public List<ProductSizeDto> getSizes() { return sizes; }
    public void setSizes(List<ProductSizeDto> sizes) { this.sizes = sizes; }
}
