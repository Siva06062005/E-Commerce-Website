package com.teezone.controller;

import com.teezone.dto.AuthRequest;
import com.teezone.dto.AuthResponse;
import com.teezone.dto.RegisterRequest;
import com.teezone.entity.Role;
import com.teezone.entity.User;
import com.teezone.repository.UserRepository;
import com.teezone.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req,
                                     @RequestParam(defaultValue = "CUSTOMER") String role) {
        if (userRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.badRequest().body("Email is already registered");
        }

        Role userRole = Role.ROLE_CUSTOMER;
        if ("SUPPLIER".equalsIgnoreCase(role)) {
            userRole = Role.ROLE_SUPPLIER;
        } else if ("ADMIN".equalsIgnoreCase(role)) {
            userRole = Role.ROLE_ADMIN;
        }

        User user = new User(
                req.getEmail(),
                passwordEncoder.encode(req.getPassword()),
                req.getName(),
                userRole
        );
        User saved = userRepository.save(user);

        String token = tokenProvider.generateToken(saved.getEmail(), saved.getRole().name());
        return ResponseEntity.ok(new AuthResponse(token, saved.getId(), saved.getFullName(), saved.getEmail(), saved.getRole().name()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest req) {
        Optional<User> userOpt = userRepository.findByEmail(req.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body("Invalid email or password");
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            // Also allow matching plain-text for initial seed/demo users if any
            if (!req.getPassword().equals(user.getPassword())) {
                return ResponseEntity.status(401).body("Invalid email or password");
            }
        }

        String token = tokenProvider.generateToken(user.getEmail(), user.getRole().name());
        return ResponseEntity.ok(new AuthResponse(token, user.getId(), user.getFullName(), user.getEmail(), user.getRole().name()));
    }
}
