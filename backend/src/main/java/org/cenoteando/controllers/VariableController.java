package org.cenoteando.controllers;

import java.util.List;
import javax.servlet.http.HttpServletResponse;
import org.cenoteando.models.Variable;
import org.cenoteando.services.VariableService;
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
@RequestMapping("/api/variables")
public class VariableController {

    private final VariableService variableService;

    public VariableController(VariableService variableService) {
        this.variableService = variableService;
    }

    @GetMapping
    public Page<Variable> getVariables(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "30") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return variableService.getVariables(pageable);
    }

    @GetMapping("/{id}")
    public Variable getVariable(@PathVariable String id){
        return variableService.getVariable(id);
    }

    @PostMapping
    @PreAuthorize(
        "hasRole('ROLE_ADMIN') or hasRole('ROLE_RESEARCHER') or hasPermission(#id, 'VARIABLE.CREATE')"
    )
    public Variable createVariable(@RequestBody Variable variable){
        return variableService.createVariable(variable);
    }

    @PutMapping("/{id}")
    @PreAuthorize(
        "hasRole('ROLE_ADMIN') or hasRole('ROLE_RESEARCHER') or hasPermission(#id, 'VARIABLE.UPDATE')"
    )
    public Variable updateVariable(
        @PathVariable String id,
        @RequestBody Variable variable
    ){
        return variableService.updateVariable(id, variable);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(
        "hasRole('ROLE_ADMIN') or hasPermission(#id, 'VARIABLE.DELETE')"
    )
    public String deleteVariable(@PathVariable String id){
        variableService.deleteVariable(id);
        return "no content";
    }

    @GetMapping("/csv")
    @PreAuthorize(
        "hasRole('ROLE_ADMIN') or hasRole('ROLE_RESEARCHER') or hasRole('ROLE_CENOTERO_ADVANCED')"
    )
    public String toCsv(HttpServletResponse response){
        response.setContentType("text/csv");
        response.setHeader(
            "Content-Disposition",
            "attachment; filename=variables.csv"
        );
        return variableService.toCsv();
    }

    @PostMapping("/csv")
    @PreAuthorize(
        "hasRole('ROLE_ADMIN') or hasRole('ROLE_RESEARCHER') or hasRole('ROLE_CENOTERO_ADVANCED')"
    )
    public List<Variable> fromCsv(
        @RequestParam("file") MultipartFile multipartfile
    ){
        return variableService.fromCsv(multipartfile);
    }
}
