package org.cenoteando.impexp;

import org.cenoteando.models.Reference;
import org.cenoteando.services.ReferenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class ImportCSVReferences extends ImportCSV{

    private final ReferenceService referenceService;

    @Autowired
    public ImportCSVReferences(ReferenceService referenceService){
        this.referenceService = referenceService;
    }

    @Override
    void csvToObject(List<String[]> lines, List<DomainEntity> entities) {
        for(String[] line : lines){
            Reference reference = new Reference();
            reference.setId(line[0]);
            reference.setAuthors(line[1]);
            reference.setShortName(line[2]);
            reference.setReference(line[3]);
            reference.setYear(line[4]);
            reference.setHasFile(Boolean.parseBoolean(line[5]));

            checkValid(reference);

            entities.add(reference);
        }
    }

    @Override
    List<DomainEntity> saveDB(List<DomainEntity> referenceList) {
        List<DomainEntity> entities = new ArrayList<>();

        for(DomainEntity ent : referenceList){
            Reference reference = (Reference) ent;
            Reference savedReference;
            if (referenceService.getReference(reference.getId()) != null) {
                savedReference = referenceService.updateReference(reference.getId(), reference);
            } else {
                savedReference = referenceService.createReference(reference);
            }
            entities.add(savedReference);
        }

        return entities;
    }
}
