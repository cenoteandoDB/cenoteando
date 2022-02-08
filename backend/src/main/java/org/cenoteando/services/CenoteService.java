package org.cenoteando.services;

import org.json.CDL;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.supercsv.cellprocessor.ift.CellProcessor;
import org.supercsv.io.CsvBeanReader;
import org.cenoteando.models.*;
import org.cenoteando.repository.CenotesRepository;
import org.cenoteando.repository.CommentBucketRepository;
import org.supercsv.io.ICsvBeanReader;
import org.supercsv.prefs.CsvPreference;

import java.io.*;
import java.util.ArrayList;
import java.util.List;


@Service
public class CenoteService {

    @Autowired
    private CenotesRepository cenoteRepository;

    @Autowired
    private GadmService gadmService;

    @Autowired
    private CommentBucketRepository commentBucketRepository;

    public Page<Cenote> getCenotes(Pageable page){
        return cenoteRepository.findAll(page);
    }

    public Cenote getCenote(String id){
        return cenoteRepository.findByArangoId("Cenotes/" + id);
    }

    public Cenote createCenote(Cenote cenote) throws Exception {
        if(!cenote.validate())
            throw new Exception("Validation failed for Cenote creation.");

        Gadm gadm = gadmService.findGadm(cenote.getGeojson().getGeometry());

        cenote.setGadm(gadm);

        return cenoteRepository.save(cenote);
    }

    public Cenote updateCenote(String id, Cenote cenote) throws Exception {
        if(!cenote.validate())
            throw new Exception("Validation failed for Cenote update.");
        Cenote oldCenote = this.getCenote(id);

        if(!cenote.getGeojson().equals(oldCenote.getGeojson()))
            oldCenote.setGadm(gadmService.findGadm(cenote.getGeojson().getGeometry()));

        oldCenote.merge(cenote);
        return cenoteRepository.save(oldCenote);
    }

    public void deleteCenote(String id) throws Exception {
        try{
            cenoteRepository.deleteById(id);
        }
        catch (Exception e){
            throw new Exception("Failed to delete cenote.");
        }
    }

    public String toCsv() throws IOException {

        Iterable<Cenote> data = cenoteRepository.findAll();

        JSONArray objs = new JSONArray();
        JSONArray names = Cenote.getHeaders();

        for(Cenote cenote: data){
            JSONObject obj = new JSONObject(cenote);
            obj.put("social", cenote.getSocial());
            obj.put("geojson", cenote.getGeojson());
            objs.put(obj);
        }
        return  CDL.rowToString(names) + CDL.toString(names, objs);
    }

    public List<String> fromCsv(MultipartFile multipartfile) throws Exception {

        Reader file_reader = new InputStreamReader(multipartfile.getInputStream());

        ArrayList<String> values = new ArrayList<>();

        ICsvBeanReader reader = new CsvBeanReader(file_reader, CsvPreference.STANDARD_PREFERENCE);

        final String[] header = reader.getHeader(true);
        final CellProcessor[] processors = Cenote.getProcessors();

        Cenote cenote, oldCenote;
        while( (cenote = reader.read(Cenote.class, header, processors)) != null ) {
            if(!cenote.validate()){
                throw new Exception("Validation failed for " + cenote.getId());
            }
            if((oldCenote = getCenote(cenote.getId())) != null) {
                oldCenote.merge(cenote);
                cenoteRepository.save(oldCenote);
            }
            else{
                cenoteRepository.save(cenote);
            }
        }

        return values;
    }

    public boolean hasAccess(User user, String id){
        Cenote cenote = getCenote(id);
        if(user == null)
            return cenote.isTouristic();
        return true;
    }

    public CommentBucket listComments(String id){
        //TODO needs to receive an User and check if he has access to this cenote
        return this.commentBucketRepository.findByCenoteId("Cenotes/" + id);
    }

    public Object getBounds(){
        return this.cenoteRepository.getBounds();
    }

}
