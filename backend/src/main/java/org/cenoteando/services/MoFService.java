package org.cenoteando.services;

import org.cenoteando.models.MeasurementOrFact;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.cenoteando.models.MeasurementOrFactBucket;
import org.cenoteando.models.Variable;
import org.cenoteando.repository.MeasurementsOrFactsRepository;
import org.cenoteando.repository.VariablesRepository;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@Service
@SuppressWarnings("rawtypes")
public class MoFService {

    @Autowired
    private MeasurementsOrFactsRepository measurementsOrFactsRepository;

    @Autowired
    private VariablesRepository variableRepository;

    public <T> HashMap<String, List<MeasurementOrFact>> getData(String id, String theme){
        String cenoteId = "Cenotes/" + id;
        Iterable<Variable> variables = variableRepository.findByTheme(theme);
        List<String> variablesIds = new ArrayList<>();
        HashMap<String, List<MeasurementOrFact>> variablesMap = new HashMap<String, List<MeasurementOrFact>>();

        for(Variable var : variables) {
            variablesIds.add(var.getArangoId());
            variablesMap.put(var.getArangoId(), null);
        }

        Iterable<MeasurementOrFactBucket> mofs = measurementsOrFactsRepository.findMeasurementsOrFacts(cenoteId, variablesIds);

        for(MeasurementOrFactBucket mof : mofs){
            variablesMap.put(mof.get_from(),mof.getMeasurements());
        }

        variablesMap.entrySet().removeIf(entry -> entry.getValue() == null);

        return variablesMap;
    }
}

