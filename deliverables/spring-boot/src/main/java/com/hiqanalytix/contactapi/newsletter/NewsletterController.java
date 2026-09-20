package com.hiqanalytix.contactapi.newsletter;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/newsletter")
public class NewsletterController {
    private final NewsletterRepository repository;

    public NewsletterController(NewsletterRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> subscribe(@Valid @RequestBody NewsletterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (!repository.existsByEmailIgnoreCase(email)) {
            NewsletterEntity subscriber = new NewsletterEntity();
            subscriber.setEmail(email);
            repository.save(subscriber);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("status", "subscribed"));
    }
}
