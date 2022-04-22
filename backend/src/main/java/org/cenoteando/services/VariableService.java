package org.cenoteando.services;

import static org.cenoteando.exceptions.ErrorMessage.*;
import static org.cenoteando.models.Variable.AccessLevel.PUBLIC;
import static org.cenoteando.models.Variable.AccessLevel.SENSITIVE;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.Iterator;
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

    public Iterable<Variable> getVariablesForMoF(String theme) {
        Authentication auth = SecurityContextHolder
            .getContext()
            .getAuthentication();

        if (
            auth instanceof AnonymousAuthenticationToken
        ) return variablesRepository.findByThemeAndPublicVariables(theme);

        User user = (User) auth.getPrincipal();

        switch (user.getRole()) {
            case ADMIN:
                return variablesRepository.findAll();
            case CENOTERO_ADVANCED:
                if (!user.getThemesWhiteList().contains(theme))
                    throw new CenoteandoException(THEME_ACCESS, theme);

                Iterable<Variable> variables = variablesRepository.findByTheme(theme);
                Iterator<Variable> iter = variables.iterator();
                while(iter.hasNext()){
                    Variable var = iter.next();
                    if(var.getAccessLevel() == SENSITIVE &&
                            !var.isCreator(user))
                        iter.remove();
                }
            case CENOTERO_BASIC:
                if (
                    user.getThemesWhiteList().contains(theme)
                ) return variablesRepository.findByTheme(theme);
                throw new CenoteandoException(THEME_ACCESS, theme);
            default:
                throw new CenoteandoException(INVALID_ROLE);
        }
    }

    public Variable getVariable(String id) {
        if (!hasReadAccess(id)) throw new CenoteandoException(
                READ_ACCESS,
                "VARIABLE",
                id
        );
        Variable variable = variablesRepository.findByArangoId(
            "Variables/" + id
        );
        return variable;
    }

    public Variable createVariable(Variable variable) {
        if (!variable.validate()) throw new CenoteandoException(INVALID_FORMAT);
        return variablesRepository.save(variable);
    }

    public Variable updateVariable(String id, Variable variable) {
        if (!variable.validate()) throw new CenoteandoException(INVALID_FORMAT);
        Variable oldVariable = this.getVariable(id);
        oldVariable.merge(variable);
        return variablesRepository.save(oldVariable);
    }

    public void deleteVariable(String id) {
        try {
            variablesRepository.deleteById(id);
        } catch (Exception e) {
            throw new CenoteandoException(DELETE_PERMISSION, "VARIABLE", id);
        }
    }

    public String toCsv() {
        Iterable<Variable> data = variablesRepository.findAll();

        StringBuilder sb = new StringBuilder();
        JSONArray names = Variable.getHeaders();
        for (Variable variable : data) {
            JSONObject object = new JSONObject(variable);
            sb.append(CsvImportExport.rowToString(object.toJSONArray(names)));
        }
        return CDL.rowToString(names) + sb;
    }

    public List<Variable> fromCsv(MultipartFile multipartfile) {
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
                        !hasUpdateAccess(
                            user,
                            variable
                        )
                    ) throw new CenoteandoException(
                        UPDATE_PERMISSION,
                        "VARIABLE",
                        variable.getTheme().toString()
                    );
                    oldVariable.merge(variable);
                    variablesRepository.save(oldVariable);
                    values.add(oldVariable);
                } else {
                    if (
                        !hasCreateAccess(
                            user,
                            variable
                        )
                    ) throw new CenoteandoException(
                        CREATE_PERMISSION,
                        "VARIABLE",
                        variable.getTheme().toString()
                    );
                    variablesRepository.save(variable);
                    values.add(variable);
                }
            }
        } catch (IOException e) {
            throw new CenoteandoException(READ_FILE);
        }

        return values;
    }

    public boolean hasCreateAccess(User user, Variable variable) {
        switch (user.getRole()) {
            case ADMIN:
                return true;
            case CENOTERO_ADVANCED:
                if(variable.getAccessLevel() == SENSITIVE)
                    return true;
                return user.getThemesWhiteList().contains(variable.getTheme().toString());
            default:
                return false;
        }
    }

    //Update and Delete permission are equal for variables
    public boolean hasUpdateAccess(User user, Variable variable) {
        switch (user.getRole()) {
            case ADMIN:
                return true;
            case CENOTERO_ADVANCED:
                if(variable.getAccessLevel() == SENSITIVE)
                    return variable.isCreator(user);
                return user.getThemesWhiteList().contains(variable.getTheme().toString());
            default:
                return false;
        }
    }

    public boolean hasReadAccess(String id) {
        Variable variable = getVariable(id);
        if (variable == null) return false;
        if(variable.getAccessLevel() == PUBLIC) return true;

        Authentication auth = SecurityContextHolder
            .getContext()
            .getAuthentication();

        if (auth instanceof AnonymousAuthenticationToken) {
            return false;
        }

        User user = (User) auth.getPrincipal();

        switch (user.getRole()) {
            case ADMIN:
                return true;
            case CENOTERO_ADVANCED:
                if(variable.getAccessLevel() == SENSITIVE)
                    return variable.isCreator(user);
                return true;
            case CENOTERO_BASIC:
                if(variable.getAccessLevel() == SENSITIVE)
                    return false;
                return user.getThemesWhiteList().contains(variable.getTheme().toString());
            default:
                return false;
        }
    }
}
