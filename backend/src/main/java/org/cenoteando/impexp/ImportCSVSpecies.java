package org.cenoteando.impexp;

import org.cenoteando.models.Species;
import org.cenoteando.services.SpeciesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class ImportCSVSpecies extends ImportCSV{

    private final SpeciesService speciesService;

    @Autowired
    public ImportCSVSpecies(SpeciesService speciesService){
        this.speciesService = speciesService;
    }

    @Override
    void csvToObject(List<String[]> lines, List<DomainEntity> entities) {
        for(String[] line : lines){
            Species species = new Species(line[1],line[2]);
            species.setId(line[0]);

            checkValid(species);

            entities.add(species);
        }
    }

    @Override
    List<DomainEntity> saveDB(List<DomainEntity> speciesList) {
        List<DomainEntity> entities = new ArrayList<>();

        for(DomainEntity ent : speciesList){
            Species species = (Species) ent;
            Species savedSpecies;
            if (speciesService.getSpecies(species.getId()) != null) {
                savedSpecies = speciesService.updateSpecies(species.getId(), species);
            } else {
                savedSpecies = speciesService.createSpecies(species);
            }
            entities.add(savedSpecies);
        }

        return entities;
    }
}
