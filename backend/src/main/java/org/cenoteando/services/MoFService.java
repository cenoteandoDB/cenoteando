package org.cenoteando.services;

import static org.cenoteando.exceptions.ErrorMessage.*;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.function.Supplier;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;
import org.cenoteando.dtos.MofDto;
import org.cenoteando.dtos.VariableWithValuesDTO;
import org.cenoteando.exceptions.CenoteandoException;
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

    public HashMap<String, VariableWithValuesDTO<Object>> getData(
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
            .forEach(variable -> {
                variablesMap.put(
                    variable.getId(),
                    new VariableWithValuesDTO<Object>(variable, null)
                );
            });

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

    public String toCsv() {
        Iterable<Object> result = measurementsOrFactsRepository.findMofs();
        Iterator<Object> mofs = result.iterator();

        //just for otimization purpose
        List<String> checkedCenotes = new ArrayList<>();
        List<String> checkedVariables = new ArrayList<>();

        StringBuilder sb = new StringBuilder();
        sb.append("cenoteId,variableId,timestamp,value");

        while (mofs.hasNext()) {
            List<Object> mof = (List<Object>) mofs.next();
            String variableId = ((String) mof.get(0)).split("/")[1];
            String cenoteId = ((String) mof.get(1)).split("/")[1];

            if (
                (
                    checkedVariables.contains(variableId) ||
                    variableService.hasReadAccess(variableId)
                ) &&
                (
                    checkedCenotes.contains(cenoteId) ||
                    cenoteService.hasReadAccess(cenoteId)
                )
            ) {
                sb.append(
                    "\n" +
                    cenoteId +
                    "," +
                    variableId +
                    "," +
                    mof.get(2) +
                    "," +
                    mof.get(3)
                );
                checkedCenotes.add(cenoteId);
                checkedVariables.add(variableId);
            }
        }

        return sb.toString();
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

        MeasurementOrFact newMof = new MeasurementOrFact(
            mof.getTimestamp(),
            mof.getValue()
        );

        if (mofBucket.getMeasurements().contains(newMof)) return;

        if (variable.getTimeseries() || mofBucket.getMeasurements().isEmpty()) {
            mofBucket.getMeasurements().add(newMof);
            mofBucket.setFirstTimestamp(mof.getTimestamp());
            mofBucket.setLastTimestamp(mof.getTimestamp());
            mofBucket.increaseCount();
            measurementsOrFactsRepository.save(mofBucket);
        }
    }

    public String cenoteMofstoCsv(String id) {
        if (!cenoteService.hasReadAccess(id)) throw new CenoteandoException(
            READ_ACCESS,
            "CENOTE",
            id
        );

        Iterable<Object> result = measurementsOrFactsRepository.findMofsByCenote(
            "Cenotes/" + id
        );
        Iterator<Object> mofs = result.iterator();

        StringBuilder sb = new StringBuilder();
        sb.append("cenoteId,variableId,timestamp,value");

        while (mofs.hasNext()) {
            List<Object> mof = (List<Object>) mofs.next();
            String variableId = ((String) mof.get(0)).split("/")[1];
            String cenoteId = ((String) mof.get(1)).split("/")[1];

            if (variableService.hasReadAccess(variableId)) {
                sb.append(
                    "\n" +
                    cenoteId +
                    "," +
                    variableId +
                    "," +
                    mof.get(2) +
                    "," +
                    mof.get(3)
                );
            }
        }

        return sb.toString();
    }
}
