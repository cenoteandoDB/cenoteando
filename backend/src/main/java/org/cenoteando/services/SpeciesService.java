package org.cenoteando.services;

import org.json.JSONArray;
import org.json.CDL;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.cenoteando.models.Species;
import org.cenoteando.repository.SpeciesRepository;
import org.springframework.web.multipart.MultipartFile;
import org.supercsv.cellprocessor.ift.CellProcessor;
import org.supercsv.io.CsvBeanReader;
import org.supercsv.io.ICsvBeanReader;
import org.supercsv.prefs.CsvPreference;

import java.io.*;
import java.util.ArrayList;
import java.util.List;


@Service
public class SpeciesService {

    @Autowired
    private SpeciesRepository speciesRepository;


    public Page<Species> getSpecies(Pageable pageable){
        return this.speciesRepository.findAll(pageable);
    }

    public Species getSpecies(String id){
        return this.speciesRepository.findByArangoId("Species/" + id);
    }

    public Species getSpeciesByAphiaId(String aphiaId){
        return this.speciesRepository.findByArangoId(aphiaId);
    }

    public Species getSpeciesByINaturalisticId(String iNaturalisticId){
        return this.speciesRepository.findByArangoId(iNaturalisticId);
    }

    public Species createSpecies(Species species) throws Exception {
        if(!species.validate())
            throw new Exception("Validation failed for Species creation.");
        return this.speciesRepository.save(species);
    }

    public Species updateSpecies(String id, Species species) throws Exception {
        if(!species.validate())
            throw new Exception("Validation failed for Species update.");
        Species oldSpecies = this.getSpecies(id);
        oldSpecies.merge(species);
        return this.speciesRepository.save(oldSpecies);
    }

    public void deleteSpecies(String id) throws Exception {
        try{
            speciesRepository.deleteById(id);
        }
        catch (Exception e){
            throw new Exception("Failed to delete species.");
        }
    }

    public String toCsv() throws IOException {

        Iterable<Species> data = speciesRepository.findAll();

        JSONArray objs = new JSONArray();
        JSONArray names = Species.getHeaders();
        JSONArray header = new JSONArray("['id', 'aphiaId', 'iNaturalistId']");
        for(Species species: data){
            objs.put(new JSONObject(species));
        }
        return CDL.rowToString(header) + CDL.toString(names, objs);
    }

    public List<String> fromCsv(MultipartFile multipartfile) throws Exception, IOException {

        Reader file_reader = new InputStreamReader(multipartfile.getInputStream());

        ArrayList<String> values = new ArrayList<>();

        ICsvBeanReader reader = new CsvBeanReader(file_reader, CsvPreference.STANDARD_PREFERENCE);


        final String[] header = reader.getHeader(true);
        final CellProcessor[] processors = Species.getProcessors();

        Species species, oldSpecies;
        while( (species = reader.read(Species.class, header, processors)) != null ) {
            if(!species.validate()){
                throw new Exception("Validation failed for " + species.getId());
            }
            if((oldSpecies = getSpecies(species.getId())) != null) {
                oldSpecies.merge(species);
                speciesRepository.save(oldSpecies);
            }
            else{
                speciesRepository.save(species);
            }
        }

        return values;
    }

}
