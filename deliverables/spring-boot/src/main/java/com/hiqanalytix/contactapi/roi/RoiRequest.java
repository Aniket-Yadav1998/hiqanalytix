package com.hiqanalytix.contactapi.roi;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;

public class RoiRequest {

    @NotBlank
    @Size(min = 2, max = 120)
    private String name;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 2, max = 160)
    private String company;

    @NotBlank
    @Size(min = 2, max = 40)
    private String industry;

    @NotNull
    @Min(1)
    @Max(100000)
    @JsonProperty("current_manpower")
    private Integer currentManpower;

    @NotNull
    @Min(1)
    @Max(10000)
    @JsonProperty("current_hours_per_week")
    private Integer currentHoursPerWeek;

    @NotBlank
    @Size(min = 2, max = 400)
    @JsonProperty("current_tools")
    private String currentTools;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }
    public Integer getCurrentManpower() { return currentManpower; }
    public void setCurrentManpower(Integer v) { this.currentManpower = v; }
    public Integer getCurrentHoursPerWeek() { return currentHoursPerWeek; }
    public void setCurrentHoursPerWeek(Integer v) { this.currentHoursPerWeek = v; }
    public String getCurrentTools() { return currentTools; }
    public void setCurrentTools(String s) { this.currentTools = s; }
}
