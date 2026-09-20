package com.hiqanalytix.contactapi.contact;

import jakarta.validation.Valid;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api")
public class ContactController {

    private final ContactService service;
    private final ObjectMapper objectMapper;
    private final String exportToken;
    private final Map<String, CopyOnWriteArrayList<Long>> contactAttempts = new ConcurrentHashMap<>();

    public ContactController(
            ContactService service,
            ObjectMapper objectMapper,
            @Value("${EXPORT_TOKEN:}") String exportToken) {
        this.service = service;
        this.objectMapper = objectMapper;
        this.exportToken = exportToken;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "healthy", "service", "hiqanalytix-api");
    }

    @GetMapping("/contact/summary")
    public Map<String, Long> summary() {
        return service.getSummary();
    }

    @GetMapping(value = "/admin/exports", produces = MediaType.TEXT_HTML_VALUE)
    public String exportPage() {
        return """
                <!doctype html>
                <html lang="en">
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <title>Contact data exports</title>
                  <style>
                    body { font-family: Arial, sans-serif; max-width: 720px; margin: 48px auto; padding: 0 20px; color: #172018; }
                    h1 { font-family: Georgia, serif; font-size: 34px; margin-bottom: 8px; }
                    p { color: #526052; line-height: 1.5; }
                    label { display: block; margin: 28px 0 8px; font-weight: 700; }
                    input { width: 100%; box-sizing: border-box; padding: 12px; border: 1px solid #b8c5b8; font-size: 16px; }
                    .actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 20px; }
                    button { border: 0; background: #1e5e29; color: white; padding: 12px 18px; font-size: 15px; cursor: pointer; }
                    button:hover { background: #48a14d; }
                    #status { min-height: 24px; margin-top: 22px; color: #1e5e29; }
                  </style>
                </head>
                <body>
                  <h1>Contact data exports</h1>
                  <p>Download stored contact records for operational work. The export token is required and is not stored by this page.</p>
                  <label for="token">Export token</label>
                  <input id="token" type="password" autocomplete="off" placeholder="Enter EXPORT_TOKEN">
                  <div class="actions">
                    <button onclick="download('csv', 'contacts.csv')">Download CSV</button>
                    <button onclick="download('json', 'contacts.json')">Download JSON</button>
                    <button onclick="download('tsv', 'contacts.xls')">Download Excel file</button>
                  </div>
                  <p id="status" role="status"></p>
                  <script>
                    async function download(format, filename) {
                      const token = document.getElementById('token').value.trim();
                      const status = document.getElementById('status');
                      if (!token) { status.textContent = 'Enter the export token first.'; return; }
                      status.textContent = 'Preparing download...';
                      try {
                        const response = await fetch('/api/contact/export?format=' + format, {
                          headers: { 'X-Export-Token': token }
                        });
                        if (!response.ok) throw new Error(response.status === 403 ? 'Invalid export token.' : 'Export failed.');
                        const blob = await response.blob();
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = filename;
                        link.click();
                        URL.revokeObjectURL(link.href);
                        status.textContent = 'Download ready.';
                      } catch (error) {
                        status.textContent = error.message;
                      }
                    }
                  </script>
                </body>
                </html>
                """;
    }

    @GetMapping("/contact/export")
    public ResponseEntity<?> export(
            @RequestParam(defaultValue = "csv") String format,
            @RequestHeader(value = "X-Export-Token", required = false) String requestToken) {
        if (exportToken.isBlank() || requestToken == null || !java.security.MessageDigest.isEqual(
                exportToken.getBytes(StandardCharsets.UTF_8),
                requestToken.getBytes(StandardCharsets.UTF_8))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("detail", "A valid export token is required"));
        }

        List<ContactEntity> contacts = service.getAll();
        String normalizedFormat = format.trim().toLowerCase();
        try {
            return switch (normalizedFormat) {
                case "json" -> download(
                        objectMapper.writeValueAsBytes(contacts),
                        MediaType.APPLICATION_JSON,
                        "contacts.json");
                case "csv" -> download(
                        csv(contacts).getBytes(StandardCharsets.UTF_8),
                        MediaType.parseMediaType("text/csv"),
                        "contacts.csv");
                case "tsv", "xls", "excel" -> download(
                        tsv(contacts).getBytes(StandardCharsets.UTF_8),
                        MediaType.parseMediaType("application/vnd.ms-excel"),
                        "contacts.xls");
                default -> ResponseEntity.badRequest()
                        .body(Map.of("detail", "format must be csv, json, or tsv"));
            };
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("detail", "Unable to export contact data"));
        }
    }

    private ResponseEntity<byte[]> download(byte[] content, MediaType mediaType, String filename) {
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(content);
    }

    private String csv(List<ContactEntity> contacts) {
        StringBuilder output = new StringBuilder();
        output.append("id,name,email,phone,telephone,company,message,follow_up,deal_status,next_followup,acquisition_source,last_contacted_at,deal_closed_at,contact_attempts,created_at\n");
        for (ContactEntity contact : contacts) {
            output.append(csvRow(
                    contact.getId(), contact.getName(), contact.getEmail(), contact.getPhone(),
                    contact.getTelephone(), contact.getCompany(), contact.getMessage(),
                    contact.getFollowUp(), contact.getDealStatus(),
                    contact.getNextFollowup() == null ? null : contact.getNextFollowup().toString(),
                    contact.getAcquisitionSource(),
                    contact.getLastContactedAt() == null ? null : contact.getLastContactedAt().toString(),
                    contact.getDealClosedAt() == null ? null : contact.getDealClosedAt().toString(),
                    contact.getContactAttempts() == null ? null : contact.getContactAttempts().toString(),
                    contact.getCreatedAt() == null ? null : contact.getCreatedAt().toString()));
        }
        return output.toString();
    }

    private String tsv(List<ContactEntity> contacts) {
        StringBuilder output = new StringBuilder();
        output.append("id\tname\temail\tphone\ttelephone\tcompany\tmessage\tfollow_up\tdeal_status\tnext_followup\tacquisition_source\tlast_contacted_at\tdeal_closed_at\tcontact_attempts\tcreated_at\n");
        for (ContactEntity contact : contacts) {
            output.append(tsvRow(
                    contact.getId(), contact.getName(), contact.getEmail(), contact.getPhone(),
                    contact.getTelephone(), contact.getCompany(), contact.getMessage(),
                    contact.getFollowUp(), contact.getDealStatus(),
                    contact.getNextFollowup() == null ? null : contact.getNextFollowup().toString(),
                    contact.getAcquisitionSource(),
                    contact.getLastContactedAt() == null ? null : contact.getLastContactedAt().toString(),
                    contact.getDealClosedAt() == null ? null : contact.getDealClosedAt().toString(),
                    contact.getContactAttempts() == null ? null : contact.getContactAttempts().toString(),
                    contact.getCreatedAt() == null ? null : contact.getCreatedAt().toString()));
        }
        return output.toString();
    }

    private String csvRow(String... values) {
        return java.util.Arrays.stream(values)
                .map(value -> "\"" + (value == null ? "" : value.replace("\"", "\"\"")) + "\"")
                .collect(java.util.stream.Collectors.joining(",")) + "\n";
    }

    private String tsvRow(String... values) {
        return java.util.Arrays.stream(values)
                .map(value -> value == null ? "" : value.replace("\t", " ").replace("\r", " ").replace("\n", " "))
                .collect(java.util.stream.Collectors.joining("\t")) + "\n";
    }


    @PostMapping("/contact")
    public ResponseEntity<ContactEntity> create(@Valid @RequestBody ContactRequest req, jakarta.servlet.http.HttpServletRequest request) {
        if (!req.isHumanConfirmed()) {
            return ResponseEntity.badRequest().build();
        }
        if (req.getWebsite() != null && !req.getWebsite().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        if (req.getFormStartedAt() != null && System.currentTimeMillis() - req.getFormStartedAt() < 2500) {
            return ResponseEntity.badRequest().build();
        }
        if (!service.isMobileValidForCountry(req)) {
            return ResponseEntity.badRequest().build();
        }
        String ip = request.getRemoteAddr();
        long now = System.currentTimeMillis();
        var attempts = contactAttempts.computeIfAbsent(ip, ignored -> new CopyOnWriteArrayList<>());
        attempts.removeIf(timestamp -> now - timestamp > TimeUnit.MINUTES.toMillis(5));
        if (attempts.size() >= 3) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build();
        }
        attempts.add(now);
        ContactEntity saved = service.save(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError err : ex.getBindingResult().getFieldErrors()) {
            errors.put(err.getField(), err.getDefaultMessage());
        }
        Map<String, Object> body = new HashMap<>();
        body.put("detail", "Validation failed");
        body.put("errors", errors);
        return ResponseEntity.badRequest().body(body);
    }
}
