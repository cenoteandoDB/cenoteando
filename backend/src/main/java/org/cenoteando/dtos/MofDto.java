package org.cenoteando.dtos;

import java.time.Instant;
import org.supercsv.cellprocessor.constraint.NotNull;
import org.supercsv.cellprocessor.ift.CellProcessor;

public class MofDto {

    private String cenoteId;
    private String variableId;
    private Instant timestamp;
    private String value;

    //necessary for csv upload
    public MofDto() {}

    public String getCenoteId() {
        return cenoteId;
    }

    public void setCenoteId(String cenoteId) {
        this.cenoteId = cenoteId;
    }

    public String getVariableId() {
        return variableId;
    }

    public void setVariableId(String variableId) {
        this.variableId = variableId;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public static CellProcessor[] getProcessors() {
        return new CellProcessor[] {
            new NotNull(), // cenoteId
            new NotNull(), // variableId
            new NotNull(), // timestamp
            new NotNull(), // value
        };
    }
}
