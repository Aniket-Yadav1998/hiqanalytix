package com.hiqanalytix.contactapi.roi;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api")
public class RoiController {

    private static final int MONEY_PCT = 35;      // mid-range 30-40%
    private static final int MANPOWER_PCT = 55;   // mid-range 50-60%
    private static final int TIME_PCT = 35;       // mid-range 30-40%

    private final RoiRepository repository;

    public RoiController(RoiRepository repository) {
        this.repository = repository;
    }

    @PostMapping("/roi-estimate")
    public ResponseEntity<RoiEntity> create(@Valid @RequestBody RoiRequest req) {
        RoiEntity e = new RoiEntity();
        e.setName(req.getName().trim());
        e.setEmail(req.getEmail().trim().toLowerCase());
        e.setCompany(req.getCompany().trim());
        e.setIndustry(req.getIndustry().trim());
        e.setCurrentManpower(req.getCurrentManpower());
        e.setCurrentHoursPerWeek(req.getCurrentHoursPerWeek());
        e.setCurrentTools(req.getCurrentTools().trim());
        e.setMoneySavingsPct(MONEY_PCT);
        e.setManpowerReductionPct(MANPOWER_PCT);
        e.setTimeReductionPct(TIME_PCT);
        e.setProjectedManpower(round2(req.getCurrentManpower() * (1 - MANPOWER_PCT / 100.0)));
        e.setProjectedHoursPerWeek(round2(req.getCurrentHoursPerWeek() * (1 - TIME_PCT / 100.0)));
        RoiEntity saved = repository.save(e);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
