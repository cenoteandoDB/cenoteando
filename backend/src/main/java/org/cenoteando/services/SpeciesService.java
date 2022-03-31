package org.cenoteando.services;

import static org.cenoteando.exceptions.ErrorMessage.*;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.List;
import org.cenoteando.exceptions.CenoteandoException;
import org.cenoteando.models.Reference;
import org.cenoteando.models.Species;
import org.cenoteando.models.SpeciesReferences;
import org.cenoteando.repository.ReferencesSpeciesRepository;
import org.cenoteando.repository.SpeciesRepository;
import org.cenoteando.utils.CsvImportExport;
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
public class SpeciesService {

    @Autowired
    private SpeciesRepository speciesRepository;

    @Autowired
    private ReferencesSpeciesRepository referencesSpeciesRepository;

    public Page<Species> getSpecies(Pageable pageable) {
        return this.speciesRepository.findAll(pageable);
    }

    public Species getSpecies(String id) {
        return this.speciesRepository.findByArangoId("Species/" + id);
    }

    public Species getSpeciesByAphiaId(String aphiaId) {
        return this.speciesRepository.findByArangoId(aphiaId);
    }

    public Species getSpeciesByINaturalisticId(String iNaturalisticId) {
        return this.speciesRepository.findByArangoId(iNaturalisticId);
    }

    public Species createSpecies(Species species) {
        if (!species.validate()) throw new CenoteandoException(INVALID_FORMAT);
        return this.speciesRepository.save(species);
    }

    public Species updateSpecies(String id, Species species) {
        if (!species.validate()) throw new CenoteandoException(INVALID_FORMAT);
        Species oldSpecies = this.getSpecies(id);
        oldSpecies.merge(species);
        return this.speciesRepository.save(oldSpecies);
    }

    public void deleteSpecies(String id) {
        try {
            speciesRepository.deleteById(id);
        } catch (Exception e) {
            throw new CenoteandoException(DELETE_PERMISSION, "SPECIES", id);
        }
    }

    public List<Reference> getSpeciesReferences(String id) {
        List<SpeciesReferences> result = referencesSpeciesRepository.findBySpecies(
            "Species/" + id
        );
        return result.stream().map(SpeciesReferences::getReference).toList();
    }

    public String toCsv() {
        Iterable<Species> data = speciesRepository.findAll();

        StringBuilder sb = new StringBuilder();
        JSONArray names = Species.getHeaders();
        for (Species species : data) {
            JSONObject object = new JSONObject(species);
            sb.append(CsvImportExport.rowToString(object.toJSONArray(names)));
        }
        return CDL.rowToString(names) + sb;
    }

    public List<Species> fromCsv(MultipartFile multipartfile) {
        ArrayList<Species> values = new ArrayList<>();

        try (
            Reader file_reader = new InputStreamReader(
                multipartfile.getInputStream()
            )
        ) {
            ICsvBeanReader reader = new CsvBeanReader(
                file_reader,
                CsvPreference.STANDARD_PREFERENCE
            );
            final String[] header = reader.getHeader(true);
            final CellProcessor[] processors = Species.getProcessors();

            Species species, oldSpecies;
            while (
                (species = reader.read(Species.class, header, processors)) !=
                null
            ) {
                if (!species.validate()) {
                    throw new CenoteandoException(INVALID_FORMAT);
                }
                if ((oldSpecies = getSpecies(species.getId())) != null) {
                    oldSpecies.merge(species);
                    speciesRepository.save(oldSpecies);
                    values.add(oldSpecies);
                } else {
                    speciesRepository.save(species);
                    values.add(species);
                }
            }
        } catch (IOException e) {
            throw new CenoteandoException(READ_FILE);
        }

        return values;
    }
}
