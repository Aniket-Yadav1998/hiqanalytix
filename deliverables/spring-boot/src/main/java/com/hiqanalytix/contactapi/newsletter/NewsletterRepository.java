package com.hiqanalytix.contactapi.newsletter;

import org.springframework.data.jpa.repository.JpaRepository;

public interface NewsletterRepository extends JpaRepository<NewsletterEntity, String> {
    boolean existsByEmailIgnoreCase(String email);
}
