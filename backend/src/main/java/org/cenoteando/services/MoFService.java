package org.cenoteando.services;

import static org.cenoteando.exceptions.ErrorMessage.*;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.*;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;
import org.cenoteando.dtos.MofDto;
import org.cenoteando.dtos.VariableWithValuesDTO;
import org.cenoteando.exceptions.CenoteandoException;
import org.cenoteando.impexp.ExportCSV;
import org.cenoteando.models.*;
import org.cenoteando.repository.MeasurementsOrFactsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.supercsv.cellprocessor.ift.CellProcessor;
import org.supercsv.io.CsvBeanReader;
import org.supercsv.io.ICsvBeanReader;
import org.supercsv.prefs.CsvPreference;

@Service
@SuppressWarnings("unchecked")
public class MoFService {

    @Autowired
    private MeasurementsOrFactsRepository measurementsOrFactsRepository;

    @Autowired
    private CenoteService cenoteService;

    @Autowired
    private VariableService variableService;

    private static final int HEADER_LENGTH = 4;

    public Map<String, VariableWithValuesDTO<Object>> getData(
        String id,
        String theme
    ) {
        String cenoteId = "Cenotes/" + id;
        if (!cenoteService.hasReadAccess(id)) throw new CenoteandoException(
            READ_ACCESS,
            "CENOTE",
            id
        );
        Iterable<Variable> variables = variableService.getVariablesForMoF(
            theme
        );

        Supplier<Stream<Variable>> variablesStreamSupplier = () ->
            StreamSupport.stream(variables.spliterator(), false);

        List<String> variablesIds = variablesStreamSupplier
            .get()
            .map(Variable::getArangoId)
            .toList();
        HashMap<String, VariableWithValuesDTO<Object>> variablesMap = new HashMap<>();

        variablesStreamSupplier
            .get()
            .forEach(variable ->
                variablesMap.put(
                    variable.getId(),
                    new VariableWithValuesDTO<>(variable, null))
            );

        Iterable<MeasurementOrFactBucket<Object>> mofs = measurementsOrFactsRepository.findMeasurementsOrFacts(
            cenoteId,
            variablesIds
        );

        for (MeasurementOrFactBucket<Object> mof : mofs) {
            // Key is just the identifier of the variable, without the collection name
            VariableWithValuesDTO<Object> varWithValues = variablesMap.get(
                mof.getVariable().split("/")[1]
            );
            varWithValues.setValues(mof.getMeasurements());
        }

        variablesMap
            .entrySet()
            .removeIf(entry -> entry.getValue().getValues() == null);

        return variablesMap;
    }


    public String[] getHeader(){
        return new String[]{"cenoteId", "variableId", "timestamp", "value"};
    }

    public List<String> fromCsv(MultipartFile multipartfile) {
        ArrayList<String> values = new ArrayList<>();

        try (
            Reader fileReader = new InputStreamReader(
                multipartfile.getInputStream()
            )
        ) {
            ICsvBeanReader reader = new CsvBeanReader(
                    fileReader,
                    CsvPreference.STANDARD_PREFERENCE
            );
            final String[] header = reader.getHeader(true);
            final CellProcessor[] processors = MofDto.getProcessors();

            MofDto mof;
            MeasurementOrFactBucket mofBucket;
            MeasurementOrFactBucket oldMofBucket;
            while (
                (mof = reader.read(MofDto.class, header, processors)) != null
            ) {
                Cenote cenote = cenoteService.getCenote(mof.getCenoteId());
                Variable variable = variableService.getVariable(
                    mof.getVariableId()
                );

                if (
                    !cenoteService.hasReadAccess(cenote.getId()) ||
                    !variableService.hasReadAccess(variable.getId())
                ) {
                    throw new CenoteandoException(
                        UPDATE_PERMISSION,
                        "MEASUREMENTORFACT",
                        mof.getCenoteId()
                    );
                }

                if (
                    (
                        oldMofBucket =
                            measurementsOrFactsRepository.findMof(
                                cenote.getArangoId(),
                                variable.getArangoId()
                            )
                    ) !=
                    null
                ) {
                    this.addMoF(oldMofBucket, mof);
                } else {
                    mofBucket = new MeasurementOrFactBucket(cenote, variable);
                    this.addMoF(mofBucket, mof);
                    measurementsOrFactsRepository.save(mofBucket);
                }
            }
        } catch (IOException e) {
            throw new CenoteandoException(READ_FILE);
        }

        return values;
    }

    private void addMoF(MeasurementOrFactBucket mofBucket, MofDto mof) {
        Variable variable = variableService.getVariable(mof.getVariableId());

        MeasurementOrFact new_mof = new MeasurementOrFact(
            mof.getTimestamp(),
            mof.getValue()
        );

        if (mofBucket.getMeasurements().contains(new_mof)) return;

        if (variable.getTimeseries() == true || mofBucket.getMeasurements().isEmpty()) {
            mofBucket.getMeasurements().add(new_mof);
            mofBucket.setFirstTimestamp(mof.getTimestamp());
            mofBucket.setLastTimestamp(mof.getTimestamp());
            mofBucket.increaseCount();
            measurementsOrFactsRepository.save(mofBucket);
        }
    }


    public String allMofToCsv() {
        Iterable<Object> mofs = measurementsOrFactsRepository.findMofs();
        return toCsv(mofs);
    }
    public String toCsv(Iterable<Object> mofs) {
        List<String[]> csv = new ArrayList<>();
        csv.add(getHeader());

        //Used for otimization. No need to verify access multiples times
        // to same variable or cenote
        Set<String> allowedCenotes = new HashSet<>();

        Iterator<Object> mofsIterator = mofs.iterator();


        while(mofsIterator.hasNext()){
            List<Object> mof = (List<Object>) mofsIterator.next();
            String[] line = new String[HEADER_LENGTH];

            String variableId = ((String) mof.get(0)).split("/")[1];
            String cenoteId = ((String) mof.get(1)).split("/")[1];

            if(allowedCenotes.contains(cenoteId)
                    || cenoteService.hasReadAccess(cenoteId) == true){
                line[0] = cenoteId;
                line[1] = variableId;
                line[2] = (String) mof.get(2);
                line[3] = mof.get(3).toString();
                csv.add(line);
                allowedCenotes.add(cenoteId);
            }
        }

        return csv.stream().map(ExportCSV::convertToCSV).collect(Collectors.joining("\n"));
    }

    public String cenoteMofstoCsv(String id) {
        if (!cenoteService.hasReadAccess(id)) throw new CenoteandoException(
            READ_ACCESS,
            "CENOTE",
            id
        );

        Iterable<Object> mofs = measurementsOrFactsRepository.findMofsByCenote(
            "Cenotes/" + id
        );

        return toCsv(mofs);
    }
}
