package org.cenoteando.impexp;

import org.cenoteando.models.Cenote;
import static org.cenoteando.models.Cenote.CenoteType.valueOf;
import org.cenoteando.services.CenoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class ImportCSVCenotes extends ImportCSV{

    private final CenoteService cenoteService;

    @Autowired
    public ImportCSVCenotes(CenoteService cenoteService){
        this.cenoteService = cenoteService;
    }

    @Override
    void csvToObject(List<String[]> lines, List<DomainEntity> entities) {
        for(String[] line : lines){
            Cenote cenote = new Cenote();
            cenote.setId(line[0]);
            cenote.setCenoteType(valueOf(line[1]));
            cenote.setName(line[2]);
            cenote.setTouristic(Boolean.parseBoolean(line[3]));
            cenote.setIssues(line[4]);
            cenote.setAlternativeNames(toList(line[5]));
            cenote.setCoordinates(line[6]);

            checkValid(cenote);

            entities.add(cenote);
        }
    }

    @Override
    List<DomainEntity> saveDB(List<DomainEntity> cenotesList) {
        List<DomainEntity> entities = new ArrayList<>();

        for(DomainEntity ent : cenotesList){
            Cenote cenote = (Cenote) ent;
            Cenote savedCenote;
            if (cenoteService.getCenote(cenote.getId()) != null) {
                savedCenote = cenoteService.updateCenote(cenote.getId(), cenote);
            } else {
                savedCenote = cenoteService.createCenote(cenote);
            }
            entities.add(savedCenote);
        }

        return entities;
    }
}
