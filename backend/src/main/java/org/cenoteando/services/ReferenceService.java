package org.cenoteando.services;

import static org.cenoteando.exceptions.ErrorMessage.*;

import java.util.List;
import org.cenoteando.exceptions.CenoteandoException;
import org.cenoteando.impexp.*;
import org.cenoteando.models.*;
import org.cenoteando.repository.ReferenceRepository;
import org.cenoteando.repository.ReferencesCenoteRepository;
import org.cenoteando.repository.ReferencesSpeciesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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
        return this.referenceRepository.findByArangoId("References/" + id);
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

        ExportCSV exp = new ExportCSV(data, "REFERENCE");
        return exp.export();
    }

    public List<DomainEntity> fromCsv(MultipartFile multipartfile) {

        ImportCSV importCSV = new ImportCSVReferences(this);
        return importCSV.importFile(multipartfile);

    }
}
