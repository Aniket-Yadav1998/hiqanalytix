package com.hiqanalytix.contactapi.contact;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.Set;

@Service
public class ContactService {

    private final ContactRepository repository;
    private static final Map<String, Set<Integer>> MOBILE_DIGITS = Map.of(
            "IN", Set.of(10), "US", Set.of(10), "CA", Set.of(10), "GB", Set.of(10),
            "DE", Set.of(10, 11), "FR", Set.of(9), "IT", Set.of(9, 10),
            "ES", Set.of(9), "NL", Set.of(9), "BE", Set.of(9), "CH", Set.of(9),
            "AT", Set.of(10, 11), "SE", Set.of(9), "NO", Set.of(8), "DK", Set.of(8),
            "FI", Set.of(9, 10), "IE", Set.of(9), "PT", Set.of(9), "PL", Set.of(9),
            "CZ", Set.of(9), "AU", Set.of(9), "NZ", Set.of(8, 9), "JP", Set.of(9, 10),
            "SG", Set.of(8), "AE", Set.of(9), "SA", Set.of(9), "ZA", Set.of(9)
    );
    private static final Map<String, String> COUNTRY_DIALS = Map.of(
            "IN", "91", "US", "1", "CA", "1", "GB", "44", "DE", "49", "FR", "33",
            "IT", "39", "ES", "34", "NL", "31", "BE", "32", "CH", "41", "AT", "43",
            "SE", "46", "NO", "47", "DK", "45", "FI", "358", "IE", "353", "PT", "351",
            "PL", "48", "CZ", "420", "AU", "61", "NZ", "64", "JP", "81", "SG", "65",
            "AE", "971", "SA", "966", "ZA", "27"
    );

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
        return repository.save(entity);
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
}
