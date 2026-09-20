package com.hiqanalytix.contactapi.contact;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "contacts")
public class ContactEntity {

    @Id
    @Column(length = 40, updatable = false, nullable = false)
    private String id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 160)
    private String email;

    @Column(nullable = false, length = 32)
    private String phone;

    @Column(length = 32)
    private String telephone;

    @Column(nullable = false, length = 160)
    private String company;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(length = 16)
    private String followUp;

    @Column(length = 24)
    private String dealStatus;

    private java.time.LocalDate nextFollowup;

    @Column(length = 80)
    private String acquisitionSource;

    private OffsetDateTime lastContactedAt;
    private OffsetDateTime dealClosedAt;

    private Integer contactAttempts;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID().toString();
        if (createdAt == null) createdAt = OffsetDateTime.now();
    }

    // Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getFollowUp() { return followUp; }
    public void setFollowUp(String followUp) { this.followUp = followUp; }
    public String getDealStatus() { return dealStatus; }
    public void setDealStatus(String dealStatus) { this.dealStatus = dealStatus; }
    public java.time.LocalDate getNextFollowup() { return nextFollowup; }
    public void setNextFollowup(java.time.LocalDate nextFollowup) { this.nextFollowup = nextFollowup; }
    public String getAcquisitionSource() { return acquisitionSource; }
    public void setAcquisitionSource(String acquisitionSource) { this.acquisitionSource = acquisitionSource; }
    public OffsetDateTime getLastContactedAt() { return lastContactedAt; }
    public void setLastContactedAt(OffsetDateTime lastContactedAt) { this.lastContactedAt = lastContactedAt; }
    public OffsetDateTime getDealClosedAt() { return dealClosedAt; }
    public void setDealClosedAt(OffsetDateTime dealClosedAt) { this.dealClosedAt = dealClosedAt; }
    public Integer getContactAttempts() { return contactAttempts; }
    public void setContactAttempts(Integer contactAttempts) { this.contactAttempts = contactAttempts; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
