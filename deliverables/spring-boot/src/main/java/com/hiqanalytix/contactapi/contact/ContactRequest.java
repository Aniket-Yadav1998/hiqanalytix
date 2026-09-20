package com.hiqanalytix.contactapi.contact;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import com.fasterxml.jackson.annotation.JsonProperty;

public class ContactRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 120)
    @Pattern(regexp = "^[\\p{L}]+(?:[ .'-][\\p{L}]+)*$", message = "Name may contain letters, spaces, apostrophes, and hyphens only")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email")
    @Size(max = 254)
    @Pattern(regexp = "^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$", message = "Enter a valid business email address")
    private String email;

    private String country;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[\\d\\s+()\\-]{6,32}$", message = "Enter a valid phone number")
    private String phone;

    @Pattern(regexp = "^$|^[\\d\\s+()\\-]{6,32}$", message = "Enter a valid telephone number")
    private String telephone;

    @NotBlank(message = "Company is required")
    @Size(min = 2, max = 160)
    private String company;

    @NotBlank(message = "Message is required")
    @Size(min = 10, max = 500)
    private String message;

    private String website;
    private Long formStartedAt;
    private boolean humanConfirmed;

    @JsonProperty("follow_up")
    private String followUp;

    @JsonProperty("deal_status")
    private String dealStatus;

    @JsonProperty("next_followup")
    private java.time.LocalDate nextFollowup;

    @JsonProperty("acquisition_source")
    private String acquisitionSource;

    public String getFollowUp() { return followUp; }
    public void setFollowUp(String followUp) { this.followUp = followUp; }
    public String getDealStatus() { return dealStatus; }
    public void setDealStatus(String dealStatus) { this.dealStatus = dealStatus; }
    public java.time.LocalDate getNextFollowup() { return nextFollowup; }
    public void setNextFollowup(java.time.LocalDate nextFollowup) { this.nextFollowup = nextFollowup; }
    public String getAcquisitionSource() { return acquisitionSource; }
    public void setAcquisitionSource(String acquisitionSource) { this.acquisitionSource = acquisitionSource; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    public Long getFormStartedAt() { return formStartedAt; }
    public void setFormStartedAt(Long formStartedAt) { this.formStartedAt = formStartedAt; }
    public boolean isHumanConfirmed() { return humanConfirmed; }
    public void setHumanConfirmed(boolean humanConfirmed) { this.humanConfirmed = humanConfirmed; }
}
