package com.hiqanalytix.contactapi.contact;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api")
public class ContactController {

    private final ContactService service;
    private final Map<String, CopyOnWriteArrayList<Long>> contactAttempts = new ConcurrentHashMap<>();

    public ContactController(ContactService service) {
        this.service = service;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "healthy", "service", "hiqanalytix-api");
    }

    @PostMapping("/contact")
    public ResponseEntity<ContactEntity> create(@Valid @RequestBody ContactRequest req, jakarta.servlet.http.HttpServletRequest request) {
        if (!req.isHumanConfirmed()) {
            return ResponseEntity.badRequest().build();
        }
        if (req.getWebsite() != null && !req.getWebsite().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        if (req.getFormStartedAt() != null && System.currentTimeMillis() - req.getFormStartedAt() < 2500) {
            return ResponseEntity.badRequest().build();
        }
        if (!service.isMobileValidForCountry(req)) {
            return ResponseEntity.badRequest().build();
        }
        String ip = request.getRemoteAddr();
        long now = System.currentTimeMillis();
        var attempts = contactAttempts.computeIfAbsent(ip, ignored -> new CopyOnWriteArrayList<>());
        attempts.removeIf(timestamp -> now - timestamp > TimeUnit.MINUTES.toMillis(5));
        if (attempts.size() >= 3) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build();
        }
        attempts.add(now);
        ContactEntity saved = service.save(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/contact")
    public List<ContactEntity> list() {
        return service.getAll();
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError err : ex.getBindingResult().getFieldErrors()) {
            errors.put(err.getField(), err.getDefaultMessage());
        }
        Map<String, Object> body = new HashMap<>();
        body.put("detail", "Validation failed");
        body.put("errors", errors);
        return ResponseEntity.badRequest().body(body);
    }
}
