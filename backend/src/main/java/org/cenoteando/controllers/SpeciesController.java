package org.cenoteando.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.cenoteando.models.Species;
import org.cenoteando.services.SpeciesService;

import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.util.List;

@RestController()
@RequestMapping("/api/species")
public class SpeciesController {

    private final SpeciesService speciesService;

    public SpeciesController(SpeciesService speciesService) {
        this.speciesService = speciesService;
    }


    @GetMapping()
    public Page<Species> getSpecies(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "30") int size){
        Pageable pageable = PageRequest.of(page, size);
        return speciesService.getSpecies(pageable);
    }

    @GetMapping("/{id}")
    public Species getSpecie(@PathVariable String id){
        return speciesService.getSpecies(id);
    }

    @PostMapping()
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public Species createSpecie(@RequestBody Species specie) throws Exception {
        return speciesService.createSpecies(specie);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public Species updateSpecie(@PathVariable String id, @RequestBody Species specie) throws Exception {
        return speciesService.updateSpecies(id,specie);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public String deleteSpecie(@PathVariable String id) throws Exception {
        speciesService.deleteSpecies(id);
        return "no content";
    }


    @GetMapping( "/csv")
    public String toCsv(HttpServletResponse response) throws IOException, IllegalAccessException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=species.csv");

        return speciesService.toCsv();
    }

    @PutMapping("/csv")
    public List<String> fromCsv(@RequestParam("file") MultipartFile multipartfile) throws Exception {
        return speciesService.fromCsv(multipartfile);
    }




}
