package com.hiqanalytix.contactapi.contact;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactRepository extends JpaRepository<ContactEntity, String> {
    long countByDealStatusIgnoreCase(String dealStatus);
    long countByFollowUpIgnoreCase(String followUp);
    long countByContactAttemptsGreaterThan(int attempts);
}
