package org.cenoteando.services;

import static org.cenoteando.exceptions.ErrorMessage.*;
import static org.cenoteando.models.Variable.AccessLevel.PUBLIC;
import static org.cenoteando.models.Variable.AccessLevel.SENSITIVE;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.List;

import org.cenoteando.exceptions.CenoteandoException;
import org.cenoteando.models.User;
import org.cenoteando.models.Variable;
import org.cenoteando.repository.VariablesRepository;
import org.cenoteando.utils.CsvImportExport;
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
import org.supercsv.io.ICsvBeanReader;
import org.supercsv.prefs.CsvPreference;

@Service
public class VariableService {

    @Autowired
    private VariablesRepository variablesRepository;

    public Page<Variable> getVariables(Pageable page) {
        return variablesRepository.findAll(page);
    }

    public Iterable<Variable> getVariablesForMoF(String theme){
        Authentication auth = SecurityContextHolder
            .getContext()
            .getAuthentication();

        if (
            auth instanceof AnonymousAuthenticationToken
        ) return variablesRepository.findByThemeAndPublicVariables(theme);

        User user = (User) auth.getPrincipal();

        switch (user.getRole()) {
            case ADMIN:
            case RESEARCHER:
                List<Variable> filteredVariables = new ArrayList<>();
                List<Variable> variables = variablesRepository.findByTheme(
                    theme
                );
                for (Variable variable : variables) if (
                    variable.getAccessLevel() != SENSITIVE ||
                    variable.isCreator(user)
                ) filteredVariables.add(variable);
                return filteredVariables;
            case CENOTERO_ADVANCED:
                if (
                    !user.getThemesBlackList().contains(theme)
                        //TODO what about sensitive variables?
                ) return variablesRepository.findByTheme(theme);
                throw new CenoteandoException(THEME_ACCESS, theme);
            case CENOTERO_BASIC:
                if (
                    user.getThemesWhiteList().contains(theme)
                ) return variablesRepository.findByTheme(theme);
                throw new CenoteandoException(THEME_ACCESS, theme);
            default:
            throw new CenoteandoException(INVALID_ROLE);
        }
    }

    public Variable getVariable(String id){
        Variable variable = variablesRepository.findByArangoId("Variables/" + id);
        if (!hasReadAccess(id)) throw new CenoteandoException(READ_ACCESS, "VARIABLE", id);
        return variable;
    }

    public Variable createVariable(Variable variable){
        if (!variable.validate()) throw new CenoteandoException(INVALID_FORMAT);
        return variablesRepository.save(variable);
    }

    public Variable updateVariable(String id, Variable variable){
        if (!variable.validate()) throw new CenoteandoException(INVALID_FORMAT);
        Variable oldVariable = this.getVariable(id);
        oldVariable.merge(variable);
        return variablesRepository.save(oldVariable);
    }

    public void deleteVariable(String id){
        try {
            variablesRepository.deleteById(id);
        } catch (Exception e) {
            throw new CenoteandoException(DELETE_PERMISSION, "VARIABLE", id);
        }
    }

    public String toCsv(){
        Iterable<Variable> data = variablesRepository.findAll();

        StringBuilder sb = new StringBuilder();
        JSONArray names = Variable.getHeaders();
        for (Variable variable : data) {
            JSONObject object = new JSONObject(variable);
            sb.append(CsvImportExport.rowToString(object.toJSONArray(names)));
        }
        return CDL.rowToString(names) + sb;
    }

    public List<Variable> fromCsv(MultipartFile multipartfile){
        Authentication auth = SecurityContextHolder
            .getContext()
            .getAuthentication();
        User user = (User) auth.getPrincipal();

        ArrayList<Variable> values = new ArrayList<>();

        try (
                Reader file_reader = new InputStreamReader(
                        multipartfile.getInputStream()
                )
        ) {

            ICsvBeanReader reader = new CsvBeanReader(
                    file_reader,
                    CsvPreference.STANDARD_PREFERENCE
            );
            final String[] header = reader.getHeader(true);
            final CellProcessor[] processors = Variable.getProcessors();

            Variable variable, oldVariable;
            while (
                (variable = reader.read(Variable.class, header, processors)) !=
                null
            ) {
                if (!variable.validate()) {
                    throw new CenoteandoException(INVALID_FORMAT);
                }
                if ((oldVariable = getVariable(variable.getId())) != null) {
                    if (
                        !hasCreateUpdateAccess(
                            user,
                            variable.getTheme().toString()
                        )
                    ) throw new CenoteandoException(UPDATE_PERMISSION, "VARIABLE", variable.getTheme().toString());
                    oldVariable.merge(variable);
                    variablesRepository.save(oldVariable);
                    values.add(oldVariable);
                } else {
                    if (
                        !hasCreateUpdateAccess(
                            user,
                            variable.getTheme().toString()
                        )
                    ) throw new CenoteandoException(CREATE_PERMISSION, "VARIABLE", variable.getTheme().toString());
                    variablesRepository.save(variable);
                    values.add(variable);
                }
            }
        }
        catch (IOException e){
            throw new CenoteandoException(READ_FILE);
        }

        return values;
    }

    public boolean hasCreateUpdateAccess(User user, String theme) {
        switch (user.getRole()) {
            case ADMIN:
            case RESEARCHER:
                return true;
            case CENOTERO_ADVANCED:
                return user.getCenoteWhiteList().contains(theme);
            default:
                return false;
        }
    }

    public boolean hasReadAccess(String id){
        Variable variable = getVariable(id);
        if(variable == null)
            return false;

        Authentication auth = SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (auth instanceof AnonymousAuthenticationToken) {
            return variable.getAccessLevel() == PUBLIC;
        }

        User user = (User) auth.getPrincipal();

        switch (user.getRole()) {
            case ADMIN:
            case RESEARCHER:
                if(variable.getAccessLevel() != SENSITIVE ||
                        variable.isCreator(user))
                return true;
            case CENOTERO_ADVANCED:
                return !user.getCenoteBlackList().contains(id);
            case CENOTERO_BASIC:
                return user.getCenoteWhiteList().contains(id);
            default:
                return false;
        }
    }
}
