package org.cenoteando.services;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.List;

import org.cenoteando.models.Reference;
import org.cenoteando.repository.ReferenceRepository;
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
import org.supercsv.io.ICsvBeanReader;
import org.supercsv.prefs.CsvPreference;

@Service
public class ReferenceService {

    @Autowired
    private ReferenceRepository referenceRepository;

    public Page<Reference> getReferences(Pageable pageable){
        return this.referenceRepository.findAll(pageable);
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

        Reader file_reader = new InputStreamReader(multipartfile.getInputStream());

        ArrayList<String> values = new ArrayList<>();

        try (ICsvBeanReader reader = new CsvBeanReader(file_reader, CsvPreference.STANDARD_PREFERENCE)) {
            final String[] header = reader.getHeader(true);
            final CellProcessor[] processors = Reference.getProcessors();

            Reference ref, oldRef;
            while( (ref = reader.read(Reference.class, header, processors)) != null ) {
                if(!ref.validate()){
                    throw new Exception("Validation failed for " + ref.getId());
                }
                if((oldRef = getReference(ref.getId())) != null) {
                    oldRef.merge(ref);
                    referenceRepository.save(oldRef);
                }
                else{
                    referenceRepository.save(ref);
                }
            }
        }

        return values;
    }
}
