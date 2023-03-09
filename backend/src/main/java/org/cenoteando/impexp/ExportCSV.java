package org.cenoteando.impexp;

import org.apache.commons.lang3.StringUtils;
import org.cenoteando.exceptions.CenoteandoException;
import org.cenoteando.models.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static org.cenoteando.exceptions.ErrorMessage.CLASSNAME_NOT_FOUND;


public class ExportCSV implements Visitor {
    private final Iterable<DomainEntity> entities;
    List<String[]> csv = new ArrayList<>();

    private String[] line;
    private final String[] headers;
    int column;

    public <T extends DomainEntity> ExportCSV(Iterable<T> entities, String entityClassName){
        this.entities = (Iterable<DomainEntity>) entities;
        this.headers = getHeader(entityClassName);
    }

    public String export(){
        csv.add(headers);

        for(DomainEntity ent : entities){
            line = new String[headers.length];
            column = 0;
            ent.accept(this);
            csv.add(line);
        }

        return csv.stream().map(ExportCSV::convertToCSV).collect(Collectors.joining("\n"));
    }


    public String[] getHeader(String className) {
        switch (className) {
            case "CENOTE":
                return new String[]{"id", "type", "name", "touristic", "issues", "alternativeNames", "coordinates"};
            case "SPECIES":
                return new String[]{"id", "aphiaId", "inaturalistId"};
            case "VARIABLE":
                return new String[]{"id", "name", "description", "type",
                        "units", "enumValues", "timeseries",
                        "multiple", "accessLevel", "theme",
                        "origin", "methodology"};
            case "REFERENCE":
                return new String[]{"id", "authors", "shortName", "reference", "year", "hasFile"};
            case "USER":
                return new String[]{"id", "name", "email", "role", "createdAt", "updatedAt"};
            default:
                throw new CenoteandoException(CLASSNAME_NOT_FOUND);
        }
    }

    public static String convertToCSV(String[] data) {
        return String.join(";", data);
    }

    @Override
    public void visit(User user) {
        line[column++] = user.getId();
        line[column++] = user.getName();
        line[column++] = user.getEmail();
        line[column++] = String.valueOf(user.getRole());
        line[column++] = String.valueOf(user.getCreatedAt());
        line[column++] = String.valueOf(user.getUpdatedAt());
    }

    @Override
    public void visit(Cenote cenote) {
        line[column++] = cenote.getId();
        line[column++] = String.valueOf(cenote.getType());
        line[column++] = cenote.getName();
        line[column++] = String.valueOf(cenote.getTouristic());
        line[column++] = StringUtils.join(cenote.getIssues(), "|");
        line[column++] = StringUtils.join(cenote.getAlternativeNames(), "|");
        line[column++] = String.format("[ %f %f ]",
                                        cenote.getCoordinates().get(0),
                                        cenote.getCoordinates().get(1)
                                        );
    }

    @Override
    public void visit(Reference reference) {
        line[column++] = reference.getId();
        line[column++] = reference.getAuthors();
        line[column++] = reference.getShortName();
        line[column++] = reference.getReference();
        line[column++] = reference.getYear();
        line[column++] = String.valueOf(reference.getHasFile());
    }

    @Override
    public void visit(Species species) {
        line[column++] = species.getId();
        line[column++] = species.getAphiaId();
        line[column++] = species.getInaturalistId();
    }

    @Override
    public void visit(Variable variable) {
        line[column++] = variable.getId();
        line[column++] = variable.getName();
        line[column++] = variable.getDescription();
        line[column++] = variable.getType().toString();
        line[column++] = variable.getUnits();
        line[column++] = StringUtils.join(variable.getEnumValues(), "|");
        line[column++] = variable.getTimeseries().toString();
        line[column++] = variable.getMultiple().toString();
        line[column++] = variable.getAccessLevel().toString();
        line[column++] = variable.getTheme().toString();
        line[column++] = variable.getOrigin().toString();
        line[column++] = variable.getMethodology();
    }
}
