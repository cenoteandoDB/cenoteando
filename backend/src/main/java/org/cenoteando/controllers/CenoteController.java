package org.cenoteando.controllers;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletResponse;

import org.cenoteando.models.Cenote;
import org.cenoteando.models.CommentBucket;
import org.cenoteando.models.MeasurementOrFact;
import org.cenoteando.services.CenoteService;
import org.cenoteando.services.CloudStorageService;
import org.cenoteando.services.MoFService;
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

@RestController()
@RequestMapping("/api/cenotes")
public class CenoteController {

    @Autowired
    private CloudStorageService cloudStorageService;

    @Autowired
    private MoFService moFService;

    private final CenoteService cenoteService;

    public CenoteController(CenoteService cenoteService) {
        this.cenoteService = cenoteService;
    }

    @GetMapping()
    public Page<Cenote> getCenotes(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "30") int size){
        Pageable pageable = PageRequest.of(page, size);
        return cenoteService.getCenotes(pageable);
    }

    @GetMapping("/{id}")
    public Cenote getCenote(@PathVariable String id) throws Exception {
        return cenoteService.getCenote(id);
    }


    @PostMapping()
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_RESEARCHER')")
    public Cenote createCenote(@RequestBody Cenote cenote) throws Exception {
        return cenoteService.createCenote(cenote);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_RESEARCHER') or hasPermission('CENOTE.UPDATE')")
    public Cenote updateCenote(@PathVariable String id, @RequestBody Cenote cenote) throws Exception {
        return cenoteService.updateCenote(id,cenote);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasPermission(#id, 'CENOTE.DELETE')")
    public String deleteCenote(@PathVariable String id) throws Exception {
        cenoteService.deleteCenote(id);
        return "no content";
    }

    @GetMapping("/{id}/comments")
    public CommentBucket listComments(@PathVariable String id) throws Exception {
        return cenoteService.listComments(id);
    }

    @GetMapping("/{id}/data/{theme}")
    public HashMap<String, List<MeasurementOrFact>> getData(@PathVariable String id, @PathVariable String theme) throws Exception {
        return moFService.getData(id, theme);
    }

    @GetMapping("/bounds")
    public Object getBounds(){
        return cenoteService.getBounds();
    }


    @GetMapping("/csv")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_RESEARCHER') or hasRole('ROLE_CENOTERO_ADVANCED')")
    public String toCsv(HttpServletResponse response) throws IOException, IllegalAccessException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=cenotes.csv");

        return  cenoteService.toCsv();
    }

    @PostMapping("/csv")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_RESEARCHER') or hasRole('ROLE_CENOTERO_ADVANCED')")
    public List<String> fromCsv(@RequestParam("file") MultipartFile multipartfile) throws Exception {
        return cenoteService.fromCsv(multipartfile);
    }

    @GetMapping("/{id}/photos")
    public List<String> getPhotos(@PathVariable String id){
        return cloudStorageService.getPhotos(id);
    }

    @GetMapping("/{id}/maps")
    public List<String> getMaps(@PathVariable String id){
        return cloudStorageService.getMaps(id);
    }


}
