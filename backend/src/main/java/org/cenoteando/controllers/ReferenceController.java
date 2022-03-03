package org.cenoteando.controllers;

import com.google.cloud.storage.Blob;
import java.io.IOException;
import java.util.List;
import javax.servlet.http.HttpServletResponse;
import org.cenoteando.models.Reference;
import org.cenoteando.services.CloudStorageService;
import org.cenoteando.services.ReferenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/references")
public class ReferenceController {

    @Autowired
    private CloudStorageService cloudStorageService;

    private final ReferenceService referenceService;

    public ReferenceController(ReferenceService referenceService) {
        this.referenceService = referenceService;
    }

    @GetMapping
    public Page<Reference> getReferences(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "30") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return referenceService.getReferences(pageable);
    }

    @GetMapping("/{id}")
    public Reference getReference(@PathVariable String id) {
        return referenceService.getReference(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public Reference createReference(@RequestBody Reference reference)
        throws Exception {
        return referenceService.createReference(reference);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public Reference updateReference(
        @PathVariable String id,
        @RequestBody Reference reference
    ) throws Exception {
        return referenceService.updateReference(id, reference);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public String deleteReference(@PathVariable String id) throws Exception {
        referenceService.deleteReference(id);
        return "no content";
    }

    @GetMapping("/csv")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public String toCsv(HttpServletResponse response)
        throws IOException, IllegalAccessException {
        response.setContentType("text/csv");
        response.setHeader(
            "Content-Disposition",
            "attachment; filename=references.csv"
        );

        return referenceService.toCsv();
    }

    @PostMapping("/csv")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public List<String> fromCsv(
        @RequestParam("file") MultipartFile multipartfile
    ) throws Exception {
        return referenceService.fromCsv(multipartfile);
    }

    @GetMapping("/{id}/download")
    public void downloadReference(
        HttpServletResponse response,
        @PathVariable String id
    ) throws Exception {
        Blob reference = cloudStorageService.downloadReference(id);

        response.setHeader(
            "Content-Disposition",
            "attachment; filename=\"" + reference.getName() + "\""
        );
        response.setContentType("application/pdf");

        response.getOutputStream().write(reference.getContent());
        response.flushBuffer();
    }
}
