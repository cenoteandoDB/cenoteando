package org.cenoteando.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.cenoteando.models.Species;
import org.json.CDL;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.supercsv.cellprocessor.ift.CellProcessor;
import org.supercsv.io.CsvBeanReader;
import org.cenoteando.models.Variable;
import org.cenoteando.repository.VariablesRepository;
import org.supercsv.io.ICsvBeanReader;
import org.supercsv.prefs.CsvPreference;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

import static org.cenoteando.utils.CsvImportExport.convertMultiPartToFile;

@Service
public class VariableService {

    @Autowired
    private VariablesRepository variablesRepository;

    public Iterable<Variable> getVariables(){
        return variablesRepository.findAll();
    }

    public Page<Variable> getVariables(int pageNum){
        Pageable page = PageRequest.of(pageNum, 30);
        return this.variablesRepository.findAll(page);
    }

    public Variable getVariable(String id){
        return variablesRepository.findByArangoId("Variables/" + id);
    }


    public Variable createVariable(Variable variable) throws Exception {
        if(!variable.validate())
            throw new Exception("Validation failed for Variable creation");
        return variablesRepository.save(variable);
    }

    public Variable updateVariable(String id, Variable variable) throws Exception {
        if(!variable.validate())
            throw new Exception("Validation failed for Variable update.");
        Variable oldVariable = this.getVariable(id);
        oldVariable.merge(variable);
        return variablesRepository.save(oldVariable);
    }

    public void deleteVariable(String id) throws Exception {
        try{
            variablesRepository.deleteById(id);
        }
        catch (Exception e){
            throw new Exception("Failed to delete variable.");
        }
    }

    public String toCsv() throws IOException {

        Iterable<Variable> data = variablesRepository.findAll();

        JSONArray objs = new JSONArray();
        JSONArray names = Variable.getHeaders();
        for(Variable variable: data){
            objs.put(new JSONObject(variable));
        }
        return CDL.rowToString(names) + CDL.toString(names, objs);
    }

    public List<String> fromCsv(MultipartFile multipartfile) throws Exception {

        File file = convertMultiPartToFile(multipartfile);

        ArrayList<String> values = new ArrayList<>();

        ICsvBeanReader reader = new CsvBeanReader(new FileReader(file), CsvPreference.STANDARD_PREFERENCE);

        final String[] header = reader.getHeader(true);
        final CellProcessor[] processors = Variable.getProcessors();

        Variable variable, oldVariable;
        while( (variable = reader.read(Variable.class, header, processors)) != null ) {
            if(!variable.validate()){
                throw new Exception("Validation failed for " + variable.getArangoId());
            }
            if((oldVariable = variablesRepository.findByArangoId(variable.getArangoId())) != null) {
                oldVariable.merge(variable);
                variablesRepository.save(oldVariable);
            }
            else{
                variablesRepository.save(variable);
            }
        }

        return values;
    }
}
