package org.cenoteando.services;

import static org.cenoteando.exceptions.ErrorMessage.*;

import java.util.List;

import org.cenoteando.exceptions.CenoteandoException;
import org.cenoteando.impexp.DomainEntity;
import org.cenoteando.impexp.ExportCSV;
import org.cenoteando.impexp.ImportCSV;
import org.cenoteando.impexp.ImportCSVSpecies;
import org.cenoteando.models.Reference;
import org.cenoteando.models.Species;
import org.cenoteando.models.SpeciesReferences;
import org.cenoteando.repository.ReferencesSpeciesRepository;
import org.cenoteando.repository.SpeciesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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

        ExportCSV exportCSV = new ExportCSV(data, "SPECIES");
        return exportCSV.export();

    }

    public List<DomainEntity> fromCsv(MultipartFile multipartfile) {

        ImportCSV importCSV = new ImportCSVSpecies(this);
        return importCSV.importFile(multipartfile);

    }
}
