package org.cenoteando.services;

import static org.cenoteando.exceptions.ErrorMessage.*;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.List;
import org.cenoteando.exceptions.CenoteandoException;
import org.cenoteando.models.*;
import org.cenoteando.repository.ReferenceRepository;
import org.cenoteando.repository.ReferencesCenoteRepository;
import org.cenoteando.repository.ReferencesSpeciesRepository;
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
public class ReferenceService {

    @Autowired
    private ReferenceRepository referenceRepository;

    @Autowired
    private ReferencesCenoteRepository referencesCenoteRepository;

    @Autowired
    private ReferencesSpeciesRepository referencesSpeciesRepository;

    public Page<Reference> getReferences(Pageable pageable) {
        return this.referenceRepository.findAll(pageable);
    }

    public Reference getReference(String id) {
        Reference reference = referenceRepository.findByArangoId("References/" + id);
        if(reference == null)
            throw new CenoteandoException(NOT_FOUND, "REFERENCE");
        return reference;
    }

    public Reference createReference(Reference reference) {
        if (!reference.validate()) throw new CenoteandoException(
            INVALID_FORMAT
        );
        return this.referenceRepository.save(reference);
    }

    public Reference updateReference(String id, Reference reference) {
        if (!reference.validate()) throw new CenoteandoException(
            INVALID_FORMAT
        );
        Reference oldReference = this.getReference(id);
        oldReference.merge(reference);
        return this.referenceRepository.save(oldReference);
    }

    public void deleteReference(String id) {
        try {
            referenceRepository.deleteById(id);
        } catch (Exception e) {
            throw new CenoteandoException(DELETE_PERMISSION, "REFERENCE", id);
        }
    }

    public List<Cenote> getCenotesReferenced(String id) {
        List<CenoteReferences> result = referencesCenoteRepository.findByReference(
            "References/" + id
        );
        return result.stream().map(CenoteReferences::getCenote).toList();
    }

    public List<Species> getSpeciesReferenced(String id) {
        List<SpeciesReferences> result = referencesSpeciesRepository.findByReference(
            "References/" + id
        );
        return result.stream().map(SpeciesReferences::getSpecies).toList();
    }

    public String toCsv() {
        Iterable<Reference> data = referenceRepository.findAll();

        StringBuilder sb = new StringBuilder();
        JSONArray names = Reference.getHeaders();

        for (Reference ref : data) {
            JSONObject object = new JSONObject(ref);
            sb.append(CsvImportExport.rowToString(object.toJSONArray(names)));
        }
        return CDL.rowToString(names) + sb;
    }

    public List<Reference> fromCsv(MultipartFile multipartfile) {
        ArrayList<Reference> values = new ArrayList<>();

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
            final CellProcessor[] processors = Reference.getProcessors();

            Reference ref, oldRef;
            while (
                (ref = reader.read(Reference.class, header, processors)) != null
            ) {
                if (!ref.validate()) {
                    throw new CenoteandoException(INVALID_FORMAT);
                }
                if ((oldRef = getReference(ref.getId())) != null) {
                    oldRef.merge(ref);
                    referenceRepository.save(oldRef);
                    values.add(oldRef);
                } else {
                    referenceRepository.save(ref);
                    values.add(ref);
                }
            }
        } catch (IOException e) {
            throw new CenoteandoException(READ_FILE);
        }

        return values;
    }
}
