package com.hiqanalytix.contactapi.contact;

import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Service
public class ContactService {

    private final ContactRepository repository;
    private static final Map<String, Set<Integer>> MOBILE_DIGITS = buildMobileDigits();
    private static final Map<String, String> COUNTRY_DIALS = buildCountryDials();

    private static Map<String, Set<Integer>> buildMobileDigits() {
        Map<String, Set<Integer>> digits = new HashMap<>();
        digits.put("IN", Set.of(10)); digits.put("US", Set.of(10)); digits.put("CA", Set.of(10)); digits.put("GB", Set.of(10));
        digits.put("DE", Set.of(10, 11)); digits.put("FR", Set.of(9)); digits.put("IT", Set.of(9, 10));
        digits.put("ES", Set.of(9)); digits.put("NL", Set.of(9)); digits.put("BE", Set.of(9)); digits.put("CH", Set.of(9));
        digits.put("AT", Set.of(10, 11)); digits.put("SE", Set.of(9)); digits.put("NO", Set.of(8)); digits.put("DK", Set.of(8));
        digits.put("FI", Set.of(9, 10)); digits.put("IE", Set.of(9)); digits.put("PT", Set.of(9)); digits.put("PL", Set.of(9));
        digits.put("CZ", Set.of(9)); digits.put("AU", Set.of(9)); digits.put("NZ", Set.of(8, 9)); digits.put("JP", Set.of(9, 10));
        digits.put("SG", Set.of(8)); digits.put("AE", Set.of(9)); digits.put("SA", Set.of(9)); digits.put("ZA", Set.of(9));
        return Map.copyOf(digits);
    }

    private static Map<String, String> buildCountryDials() {
        Map<String, String> dials = new HashMap<>();
        dials.put("IN", "91"); dials.put("US", "1"); dials.put("CA", "1"); dials.put("GB", "44"); dials.put("DE", "49"); dials.put("FR", "33");
        dials.put("IT", "39"); dials.put("ES", "34"); dials.put("NL", "31"); dials.put("BE", "32"); dials.put("CH", "41"); dials.put("AT", "43");
        dials.put("SE", "46"); dials.put("NO", "47"); dials.put("DK", "45"); dials.put("FI", "358"); dials.put("IE", "353"); dials.put("PT", "351");
        dials.put("PL", "48"); dials.put("CZ", "420"); dials.put("AU", "61"); dials.put("NZ", "64"); dials.put("JP", "81"); dials.put("SG", "65");
        dials.put("AE", "971"); dials.put("SA", "966"); dials.put("ZA", "27");
        return Map.copyOf(dials);
    }

    public ContactService(ContactRepository repository) {
        this.repository = repository;
    }

    public ContactEntity save(ContactRequest req) {
        ContactEntity entity = new ContactEntity();
        entity.setName(req.getName().trim());
        entity.setEmail(req.getEmail().trim().toLowerCase());
        entity.setPhone(req.getPhone().trim());
        entity.setTelephone(req.getTelephone() == null ? null : req.getTelephone().trim());
        entity.setCompany(req.getCompany().trim());
        entity.setMessage(req.getMessage().trim());
        entity.setFollowUp(normalize(req.getFollowUp(), "no"));
        entity.setDealStatus(normalize(req.getDealStatus(), "new"));
        entity.setNextFollowup(req.getNextFollowup());
        entity.setAcquisitionSource(trimToNull(req.getAcquisitionSource()));
        entity.setContactAttempts(0);
        return repository.save(entity);
    }

    private static String normalize(String value, String fallback) {
        String normalized = trimToNull(value);
        return normalized == null ? fallback : normalized.toLowerCase();
    }

    private static String trimToNull(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }

    public boolean isMobileValidForCountry(ContactRequest req) {
        if (req.getCountry() == null || !MOBILE_DIGITS.containsKey(req.getCountry())) return true;
        String digitsOnly = req.getPhone().replaceAll("\\D", "");
        String dial = COUNTRY_DIALS.get(req.getCountry());
        if (digitsOnly.startsWith(dial)) digitsOnly = digitsOnly.substring(dial.length());
        int digits = digitsOnly.length();
        return MOBILE_DIGITS.get(req.getCountry()).contains(digits);
    }

    public java.util.List<ContactEntity> getAll() {
        return repository.findAll();
    }

    public Map<String, Long> getSummary() {
        Map<String, Long> summary = new java.util.LinkedHashMap<>();
        summary.put("totalLeads", repository.count());
        summary.put("followUpRequired", repository.countByFollowUpIgnoreCase("yes"));
        summary.put("contacted", repository.countByContactAttemptsGreaterThan(0));
        summary.put("closedDeals", repository.countByDealStatusIgnoreCase("closed"));
        summary.put("newLeads", repository.countByDealStatusIgnoreCase("new"));
        return summary;
    }

}
