package org.cenoteando.controllers;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.cenoteando.models.Variable;
import org.cenoteando.services.VariableService;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@RestController()
@RequestMapping("/api/variables")
public class VariableController {

    private final VariableService variableService;

    public VariableController(VariableService variableService) {
        this.variableService = variableService;
    }

    @GetMapping()
    public Page<Variable> getVariables(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "30") int size){
        Pageable pageable = PageRequest.of(page, size);
        return variableService.getVariables(pageable);
    }

    @GetMapping("/{id}")
    public Variable getVariable(@PathVariable String id){
        return variableService.getVariable(id);
    }

    @PostMapping()
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public Variable createVariable(@RequestBody Variable variable) throws Exception {
        return variableService.createVariable(variable);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public Variable updateVariable(@PathVariable String id, @RequestBody Variable variable) throws Exception {
        return variableService.updateVariable(id,variable);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public String deleteVariable(@PathVariable String id) throws Exception {
        variableService.deleteVariable(id);
        return "no content";
    }

    @GetMapping("/csv")
    public String toCsv(HttpServletResponse response) throws IOException, IllegalAccessException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=variables.csv");
        return variableService.toCsv();
    }

    @PostMapping("/csv")
    public List<String> fromCsv(@RequestParam("file") MultipartFile multipartfile) throws Exception {
        return variableService.fromCsv(multipartfile);
    }



}
