package org.cenoteando.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.cenoteando.models.*;
import org.cenoteando.services.*;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;

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
    public Iterable<Cenote> getCenotes(@RequestParam int page){
        return cenoteService.getCenotes(page);
    }

    @GetMapping("/{id}")
    public Cenote getCenote(@PathVariable String id){
        return cenoteService.getCenote(id);
    }


    @PostMapping()
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public Cenote createCenote(@RequestBody Cenote cenote) throws Exception {
        return cenoteService.createCenote(cenote);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public Cenote updateCenote(@PathVariable String id, @RequestBody Cenote cenote) throws Exception {
        return cenoteService.updateCenote(id,cenote);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public String deleteCenote(@PathVariable String id) throws Exception {
        cenoteService.deleteCenote(id);
        return "no content";
    }

    @GetMapping("/{id}/comments")
    public CommentBucket listComments(@PathVariable String id){
        return cenoteService.listComments(id);
    }

    @GetMapping("/{id}/data/{theme}")
    public HashMap<String, List<MeasurementOrFact>> getData(@PathVariable String id, @PathVariable String theme){
        return moFService.getData(id, theme);
    }

    @GetMapping("/bounds")
    public Object getBounds(){
        return cenoteService.getBounds();
    }


    @GetMapping("/csv")
    public String toCsv(HttpServletResponse response) throws IOException, IllegalAccessException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=cenotes.csv");

        return  cenoteService.toCsv();
    }

    @PutMapping("/csv")
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
