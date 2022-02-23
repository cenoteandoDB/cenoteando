package org.cenoteando.services;

import java.util.HashMap;
import java.util.List;
import java.util.function.Supplier;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

import org.cenoteando.dtos.VariableWithValuesDTO;
import org.cenoteando.models.MeasurementOrFactBucket;
import org.cenoteando.models.Variable;
import org.cenoteando.repository.MeasurementsOrFactsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MoFService {

    @Autowired
    private MeasurementsOrFactsRepository measurementsOrFactsRepository;

    @Autowired
    private VariableService variableService;

    public HashMap<String, VariableWithValuesDTO<Object>> getData(String id, String theme) throws Exception {
        String cenoteId = "Cenotes/" + id;
        Iterable<Variable> variables = variableService.getVariablesForMoF(theme);

        Supplier<Stream<Variable>> variablesStreamSupplier = () -> StreamSupport.stream(variables.spliterator(), false);

        List<String> variablesIds = variablesStreamSupplier.get().map(Variable::getArangoId).toList();
        HashMap<String, VariableWithValuesDTO<Object>> variablesMap = new HashMap<>();

        variablesStreamSupplier.get().forEach((variable) -> {
            variablesMap.put(variable.getId(), new VariableWithValuesDTO<Object>(variable, null));
        });

        Iterable<MeasurementOrFactBucket<Object>> mofs = measurementsOrFactsRepository.findMeasurementsOrFacts(cenoteId, variablesIds);

        for(MeasurementOrFactBucket<Object> mof : mofs){
            // Key is just the identifier of the variable, without the collection name
            VariableWithValuesDTO<Object> varWithValues = variablesMap.get(mof.get_from().split("/")[1]);
            varWithValues.setValues(mof.getMeasurements());
        }

        variablesMap.entrySet().removeIf(entry -> entry.getValue().getValues() == null);

        return variablesMap;
    }
}

