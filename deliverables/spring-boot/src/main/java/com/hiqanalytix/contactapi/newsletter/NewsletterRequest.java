package com.hiqanalytix.contactapi.newsletter;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class NewsletterRequest {
    @NotBlank
    @Email
    @Size(max = 254)
    @Pattern(
            regexp = "^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$",
            message = "Enter a valid email address"
    )
    private String email;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
