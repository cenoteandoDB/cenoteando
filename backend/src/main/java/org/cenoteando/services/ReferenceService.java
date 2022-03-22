package org.cenoteando.services;

import java.io.InputStreamReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.List;
import org.cenoteando.models.Reference;
import org.cenoteando.repository.ReferenceRepository;
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

    public Page<Reference> getReferences(Pageable pageable) {
        return this.referenceRepository.findAll(pageable);
    }

    public Reference getReference(String id) {
        return this.referenceRepository.findByKey(id);
    }

    public Reference createReference(Reference reference) throws Exception {
        if (!reference.validate()) throw new Exception(
            "Validation failed for Reference creation."
        );
        return this.referenceRepository.save(reference);
    }

    public Reference updateReference(String id, Reference reference)
        throws Exception {
        if (!reference.validate()) throw new Exception(
            "Validation failed for Reference update."
        );
        Reference oldReference = this.getReference(id);
        oldReference.merge(reference);
        return this.referenceRepository.save(oldReference);
    }

    public void deleteReference(String id) throws Exception {
        try {
            referenceRepository.deleteById(id);
        } catch (Exception e) {
            throw new Exception("Failed to delete reference.");
        }
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

    public List<Reference> fromCsv(MultipartFile multipartfile) throws Exception {
        Reader fileReader = new InputStreamReader(
            multipartfile.getInputStream()
        );

        ArrayList<Reference> values = new ArrayList<>();

        try (
            ICsvBeanReader reader = new CsvBeanReader(
                fileReader,
                CsvPreference.STANDARD_PREFERENCE
            )
        ) {
            final String[] header = reader.getHeader(true);
            final CellProcessor[] processors = Reference.getProcessors();

            Reference ref;
            Reference oldRef;
            while (
                (ref = reader.read(Reference.class, header, processors)) != null
            ) {
                if (!ref.validate()) {
                    throw new Exception("Validation failed for " + ref.getId());
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
        }

        return values;
    }

    public void unsetAllHasFile() {
        referenceRepository.unsetAllHasFile();
    }
}
