package org.cenoteando.controllers;

import java.util.List;
import javax.servlet.http.HttpServletResponse;

import org.cenoteando.dtos.MofDto;
import org.cenoteando.models.MeasurementOrFactBucket;
import org.cenoteando.services.MoFService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/mof")
public class MofController {

    private final MoFService moFService;

    public MofController(MoFService moFService) {
        this.moFService = moFService;
    }

    @PostMapping("/{cenoteId}/{variableId}")
    @PreAuthorize(
            "hasRole('ROLE_ADMIN') or hasRole('ROLE_CENOTERO_ADVANCED')"
    )
    public MeasurementOrFactBucket createMof(
            @PathVariable String cenoteId,
            @PathVariable String variableId,
            @RequestBody MofDto mofDto
    ) {
        return moFService.createMof(cenoteId, variableId, mofDto);
    }

    @DeleteMapping("/{cenoteId}/{variableId}")
    @PreAuthorize(
            "hasRole('ROLE_ADMIN') or hasRole('ROLE_CENOTERO_ADVANCED')"
    )
    public String deleteMof(
            @PathVariable String cenoteId,
            @PathVariable String variableId,
            @RequestBody MofDto mofDto
    ) {
        return moFService.deleteMof(cenoteId, variableId, mofDto);
    }

    @GetMapping("/csv")
    @PreAuthorize(
        "hasRole('ROLE_ADMIN') or hasRole('ROLE_CENOTERO_ADVANCED')"
    )
    public String mofstoCsv(HttpServletResponse response) {
        response.setContentType("text/csv");
        response.setHeader(
            "Content-Disposition",
            "attachment; filename=mofs.csv"
        );

        return moFService.toCsv();
    }

    @PostMapping("/csv")
    @PreAuthorize(
        "hasRole('ROLE_ADMIN') or hasRole('ROLE_CENOTERO_ADVANCED')"
    )
    public List<String> mofFromCsv(
        @RequestParam("file") MultipartFile multipartfile
    ) {
        return moFService.fromCsv(multipartfile);
    }

    @GetMapping("{id}/csv")
    public String cenoteMofstoCsv(
        HttpServletResponse response,
        @PathVariable String id
    ) {
        response.setContentType("text/csv");
        response.setHeader(
            "Content-Disposition",
            "attachment; filename=" + id + "_mofs.csv"
        );

        return moFService.cenoteMofstoCsv(id);
    }
}
