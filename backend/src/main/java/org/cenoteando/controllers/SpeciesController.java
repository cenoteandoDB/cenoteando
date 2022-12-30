package org.cenoteando.controllers;

import java.util.List;
import javax.servlet.http.HttpServletResponse;
import org.cenoteando.models.Reference;
import org.cenoteando.models.Species;
import org.cenoteando.services.SpeciesService;
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
@RequestMapping("/api/species")
public class SpeciesController {

    @Autowired
    private SpeciesService speciesService;

    public SpeciesController() {}

    @GetMapping
    public Page<Species> getSpecies(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "30") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return speciesService.getSpecies(pageable);
    }

    @GetMapping("/{id}")
    public Species getSpecie(@PathVariable String id) {
        return speciesService.getSpecies(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public Species createSpecie(@RequestBody Species specie) {
        return speciesService.createSpecies(specie);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public Species updateSpecie(
        @PathVariable String id,
        @RequestBody Species specie
    ) {
        return speciesService.updateSpecies(id, specie);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public String deleteSpecie(@PathVariable String id) {
        speciesService.deleteSpecies(id);
        return "no content";
    }

    @GetMapping("/{id}/references")
    public List<Reference> getSpeciesReferences(@PathVariable String id) {
        return speciesService.getSpeciesReferences(id);
    }

    @GetMapping("/csv")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public String toCsv(HttpServletResponse response) {
        response.setContentType("text/csv");
        response.setHeader(
            "Content-Disposition",
            "attachment; filename=species.csv"
        );

        return speciesService.toCsv();
    }

    @PostMapping("/csv")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public List<Species> fromCsv(
        @RequestParam("file") MultipartFile multipartfile
    ) {
        return speciesService.fromCsv(multipartfile);
    }
}
