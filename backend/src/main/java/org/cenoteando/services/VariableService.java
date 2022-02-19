package org.cenoteando.services;

import org.cenoteando.models.User;
import org.json.CDL;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

import static org.cenoteando.models.Variable.AccessLevel.SENSITIVE;


@Service
public class VariableService {

    @Autowired
    private VariablesRepository variablesRepository;

    public Page<Variable> getVariables(Pageable page) {
        return variablesRepository.findAll(page);
    }

    public Iterable<Variable> getVariablesForMoF(String theme) throws Exception {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if(auth instanceof AnonymousAuthenticationToken)
            return variablesRepository.findByThemeAndPublicVariables(theme);

        User user = (User) auth.getPrincipal();

        switch (user.getRole()){
            case ADMIN:
            case RESEARCHER:
                List<Variable> filteredVariables = new ArrayList<>();
                List<Variable> variables = variablesRepository.findByTheme(theme);
                for(Variable variable: variables)
                    if(variable.getAccessLevel() != SENSITIVE || variable.isCreator(user))
                        filteredVariables.add(variable);
                return filteredVariables;
            case CENOTERO_ADVANCED:
                if(user.getThemesBlackList() == null)
                    user.setThemesBlackList(new ArrayList<>());
                if(!user.getThemesBlackList().contains(theme))
                    return variablesRepository.findByTheme(theme);
                throw new Exception("User forbidden to get variable with theme " + theme);
            case CENOTERO_BASIC:
                if(user.getThemesWhiteList() == null)
                    user.setThemesWhiteList(new ArrayList<>());
                if(user.getThemesWhiteList().contains(theme))
                    return variablesRepository.findByTheme(theme);
                throw new Exception("User forbidden to get variable with theme " + theme);
            default:
                throw new Exception("Role not available.");
        }
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

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();

        Reader file_reader = new InputStreamReader(multipartfile.getInputStream());

        ArrayList<String> values = new ArrayList<>();

        ICsvBeanReader reader = new CsvBeanReader(file_reader, CsvPreference.STANDARD_PREFERENCE);

        final String[] header = reader.getHeader(true);
        final CellProcessor[] processors = Variable.getProcessors();

        Variable variable, oldVariable;
        while( (variable = reader.read(Variable.class, header, processors)) != null ) {
            if(!variable.validate()){
                throw new Exception("Validation failed for " + variable.getId());
            }
            if((oldVariable = getVariable(variable.getId())) != null) {
                if(!hasCreateUpdateAccess(user, variable.getTheme().toString()))
                    throw new Exception("User doesn't have permission to update variable " + variable.getId());
                oldVariable.merge(variable);
                variablesRepository.save(oldVariable);
            }
            else{
                if(!hasCreateUpdateAccess(user, variable.getTheme().toString()))
                    throw new Exception("User doesn't have permission to create variable " + variable.getId());
                variablesRepository.save(variable);
            }
        }

        return values;
    }

    public boolean hasCreateUpdateAccess(User user, String theme){
        switch (user.getRole()){
            case ADMIN:
            case RESEARCHER:
                return true;
            case CENOTERO_ADVANCED:
                return user.getCenoteWhiteList().contains(theme);
            default:
                return false;
        }
    }
}
