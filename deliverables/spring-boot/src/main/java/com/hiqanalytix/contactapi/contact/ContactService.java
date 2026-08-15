package com.hiqanalytix.contactapi.contact;

import org.springframework.stereotype.Service;

@Service
public class ContactService {

    private final ContactRepository repository;

    public ContactService(ContactRepository repository) {
        this.repository = repository;
    }

    public ContactEntity save(ContactRequest req) {
        ContactEntity entity = new ContactEntity();
        entity.setName(req.getName().trim());
        entity.setEmail(req.getEmail().trim().toLowerCase());
        entity.setPhone(req.getPhone().trim());
        entity.setCompany(req.getCompany().trim());
        entity.setMessage(req.getMessage().trim());
        return repository.save(entity);
    }

    public java.util.List<ContactEntity> getAll() {
        return repository.findAll();
    }
}
