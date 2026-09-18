package com.teezone.controller;

import com.teezone.dto.ApiResponse;
import com.teezone.entity.Order;
import com.teezone.entity.OrderItem;
import com.teezone.entity.OrderStatus;
import com.teezone.entity.User;
import com.teezone.repository.OrderRepository;
import com.teezone.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public OrderController(OrderRepository orderRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/orders")
    public ResponseEntity<Order> createOrder(@RequestBody Map<String, Object> payload) {
        Order order = new Order();
        order.setOrderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setCustomerName((String) payload.getOrDefault("customerName", "Guest Customer"));
        order.setCustomerEmail((String) payload.getOrDefault("customerEmail", "customer@example.com"));
        order.setShippingPhone((String) payload.getOrDefault("shippingPhone", "+91 9876543210"));
        order.setShippingAddress((String) payload.getOrDefault("shippingAddress", "India"));
        order.setPaymentMethod((String) payload.getOrDefault("paymentMethod", "UPI"));
        order.setStatus(OrderStatus.CONFIRMED);

        Number subtotal = (Number) payload.getOrDefault("subtotal", 0);
        order.setSubtotal(new java.math.BigDecimal(subtotal.toString()));

        Number shipping = (Number) payload.getOrDefault("shippingFee", 0);
        order.setShippingFee(new java.math.BigDecimal(shipping.toString()));

        Number tax = (Number) payload.getOrDefault("tax", 0);
        order.setTax(new java.math.BigDecimal(tax.toString()));

        Number total = (Number) payload.getOrDefault("totalAmount", 0);
        order.setTotalAmount(new java.math.BigDecimal(total.toString()));

        if (payload.get("userId") != null) {
            Long userId = Long.valueOf(payload.get("userId").toString());
            userRepository.findById(userId).ifPresent(order::setUser);
        }

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) payload.get("items");
        if (items != null) {
            for (Map<String, Object> itemData : items) {
                OrderItem item = new OrderItem();
                if (itemData.get("productId") != null) {
                    item.setProductId(Long.valueOf(itemData.get("productId").toString()));
                }
                item.setProductName((String) itemData.getOrDefault("productName", "Product"));
                item.setSize((String) itemData.getOrDefault("size", "M"));
                item.setColor((String) itemData.getOrDefault("color", "Black"));
                Number itemPrice = (Number) itemData.getOrDefault("price", 0);
                item.setPrice(new java.math.BigDecimal(itemPrice.toString()));
                Number itemQty = (Number) itemData.getOrDefault("quantity", 1);
                item.setQuantity(itemQty.intValue());
                item.setImage((String) itemData.get("image"));
                item.setFulfillmentStatus("NEW");
                order.addItem(item);
            }
        }

        Order saved = orderRepository.save(order);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getMyOrders(@RequestParam(required = false) Long userId) {
        if (userId != null) {
            return ResponseEntity.ok(orderRepository.findByUserIdOrderByCreatedAtDesc(userId));
        }
        return ResponseEntity.ok(orderRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/admin/orders")
    public ResponseEntity<List<Order>> getAllOrdersAdmin() {
        return ResponseEntity.ok(orderRepository.findAllByOrderByCreatedAtDesc());
    }

    @PutMapping("/admin/orders/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String newStatusStr = body.get("status");
        return orderRepository.findById(id).map(order -> {
            try {
                OrderStatus newStatus = OrderStatus.valueOf(newStatusStr.toUpperCase());
                order.setStatus(newStatus);
                return ResponseEntity.ok(orderRepository.save(order));
            } catch (Exception e) {
                return ResponseEntity.badRequest().<Order>build();
            }
        }).orElse(ResponseEntity.notFound().build());
    }
}
