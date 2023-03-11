package org.cenoteando.impexp;

import org.cenoteando.models.Variable;
import static org.cenoteando.models.Variable.VariableType;
import org.cenoteando.services.VariableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class ImportCSVVariables extends ImportCSV{

    private final VariableService variableService;

    @Autowired
    public ImportCSVVariables(VariableService variableService){
        this.variableService = variableService;
    }

    @Override
    void csvToObject(List<String[]> lines, List<DomainEntity> entities) {
        for(String[] line : lines){
            Variable variable = new Variable();
            variable.setId(line[0]);
            variable.setName(line[1]);
            variable.setDescription(line[2]);
            variable.setType(VariableType.valueOf(line[3]));
            variable.setUnits(line[4]);
            variable.setEnumValues(line[5]);
            variable.setTimeseries(Boolean.valueOf(line[6]));
            variable.setMultiple(Boolean.valueOf(line[7]));
            variable.setAccessLevel(line[8]);
            variable.setTheme(line[9]);
            variable.setOrigin(line[10]);
            variable.setMethodology(line[11]);

            checkValid(variable);

            entities.add(variable);
        }
    }

    @Override
    List<DomainEntity> saveDB(List<DomainEntity> variableList) {
        //TODO check permissions to update and create variables

        List<DomainEntity> entities = new ArrayList<>();

        for(DomainEntity ent : variableList){
            Variable variable = (Variable) ent;
            Variable savedVariable;
            if (variableService.getVariable(variable.getId()) != null) {
                savedVariable = variableService.updateVariable(variable.getId(), variable);
            } else {
                savedVariable = variableService.createVariable(variable);
            }
            entities.add(savedVariable);
        }

        return entities;
    }
}
