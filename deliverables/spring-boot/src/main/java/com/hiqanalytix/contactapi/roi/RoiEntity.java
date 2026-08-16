package com.hiqanalytix.contactapi.roi;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "roi_leads")
public class RoiEntity {

    @Id
    @Column(length = 40, updatable = false, nullable = false)
    private String id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 160)
    private String email;

    @Column(nullable = false, length = 160)
    private String company;

    @Column(nullable = false, length = 40)
    private String industry;

    @Column(nullable = false)
    private Integer currentManpower;

    @Column(nullable = false)
    private Integer currentHoursPerWeek;

    @Column(nullable = false, length = 400)
    private String currentTools;

    @Column(nullable = false)
    private Integer moneySavingsPct;

    @Column(nullable = false)
    private Integer manpowerReductionPct;

    @Column(nullable = false)
    private Integer timeReductionPct;

    @Column(nullable = false)
    private Double projectedManpower;

    @Column(nullable = false)
    private Double projectedHoursPerWeek;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID().toString();
        if (createdAt == null) createdAt = OffsetDateTime.now();
    }

    // getters / setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
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
    public void setCurrentTools(String currentTools) { this.currentTools = currentTools; }
    public Integer getMoneySavingsPct() { return moneySavingsPct; }
    public void setMoneySavingsPct(Integer v) { this.moneySavingsPct = v; }
    public Integer getManpowerReductionPct() { return manpowerReductionPct; }
    public void setManpowerReductionPct(Integer v) { this.manpowerReductionPct = v; }
    public Integer getTimeReductionPct() { return timeReductionPct; }
    public void setTimeReductionPct(Integer v) { this.timeReductionPct = v; }
    public Double getProjectedManpower() { return projectedManpower; }
    public void setProjectedManpower(Double v) { this.projectedManpower = v; }
    public Double getProjectedHoursPerWeek() { return projectedHoursPerWeek; }
    public void setProjectedHoursPerWeek(Double v) { this.projectedHoursPerWeek = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
}
