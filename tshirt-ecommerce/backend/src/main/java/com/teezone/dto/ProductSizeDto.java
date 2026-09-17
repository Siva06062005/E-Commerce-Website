package com.teezone.dto;

public class ProductSizeDto {
    private String size;
    private Integer stock;

    public ProductSizeDto() {}

    public ProductSizeDto(String size, Integer stock) {
        this.size = size;
        this.stock = stock;
    }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
}
