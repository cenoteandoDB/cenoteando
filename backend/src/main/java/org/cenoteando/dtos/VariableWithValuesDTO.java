package org.cenoteando.dtos;

import org.cenoteando.models.MeasurementOrFact;
import org.cenoteando.models.Variable;

public class VariableWithValuesDTO<T> {
    private Variable variable;
    private Iterable<MeasurementOrFact<T>> values;

    public VariableWithValuesDTO(Variable variable, Iterable<MeasurementOrFact<T>> values) {
        this.variable = variable;
        this.values = values;
    }

    public Variable getVariable() {
        return variable;
    }

    public void setVariable(Variable variable) {
        this.variable = variable;
    }

    public Iterable<MeasurementOrFact<T>> getValues() {
        return values;
    }

    public void setValues(Iterable<MeasurementOrFact<T>> values) {
        this.values = values;
    } 
    
}
