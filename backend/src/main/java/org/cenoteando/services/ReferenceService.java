package org.cenoteando.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.json.CDL;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.supercsv.cellprocessor.ift.CellProcessor;
import org.supercsv.io.CsvBeanReader;
import org.supercsv.io.CsvBeanWriter;
import org.cenoteando.models.Reference;
import org.cenoteando.repository.ReferenceRepository;
import org.supercsv.io.ICsvBeanReader;
import org.supercsv.prefs.CsvPreference;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

import static org.cenoteando.utils.CsvImportExport.convertMultiPartToFile;

@Service
public class ReferenceService {

    @Autowired
    private ReferenceRepository referenceRepository;

    public Iterable<Reference> getReferences(){
        return this.referenceRepository.findAll();
    }

    public Reference getReference(String id){
        return this.referenceRepository.findByArangoId("References/" + id);
    }

    public Reference createReference(Reference reference) throws Exception {
        if(!reference.validate())
            throw new Exception("Validation failed for Reference creation.");
        return this.referenceRepository.save(reference);
    }

    public Reference updateReference(String id, Reference reference) throws Exception {
        if(!reference.validate())
            throw new Exception("Validation failed for Reference update.");
        Reference oldReference = this.getReference(id);
        oldReference.merge(reference);
        return this.referenceRepository.save(oldReference);
    }

    public void deleteReference(String id) throws Exception {
        try{
            referenceRepository.deleteById(id);
        }
        catch (Exception e){
            throw new Exception("Failed to delete reference.");
        }
    }

    public String toCsv() throws IOException {

        Iterable<Reference> data = referenceRepository.findAll();

        JSONArray objs = new JSONArray();
        JSONArray names = Reference.getHeaders();

        for(Reference ref: data){
            objs.put(new JSONObject(ref));
        }
        return CDL.rowToString(names) + CDL.toString(names, objs);
    }

    public List<String> fromCsv(MultipartFile multipartfile) throws Exception {

        File file = convertMultiPartToFile(multipartfile);

        ArrayList<String> values = new ArrayList<>();

        ICsvBeanReader reader = new CsvBeanReader(new FileReader(file), CsvPreference.STANDARD_PREFERENCE);

        final String[] header = reader.getHeader(true);
        final CellProcessor[] processors = Reference.getProcessors();

        Reference ref, oldRef;
        while( (ref = reader.read(Reference.class, header, processors)) != null ) {
            if(!ref.validate()){
                throw new Exception("Validation failed for " + ref.getArangoId());
            }
            if((oldRef = referenceRepository.findByArangoId(ref.getArangoId())) != null) {
                oldRef.merge(ref);
                referenceRepository.save(oldRef);
            }
            else{
                referenceRepository.save(ref);
            }
        }

        return values;
    }
}
