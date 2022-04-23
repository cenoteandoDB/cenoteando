package org.cenoteando.models;

import com.arangodb.springframework.annotation.ArangoId;
import com.arangodb.springframework.annotation.Edge;
import com.arangodb.springframework.annotation.From;
import com.arangodb.springframework.annotation.To;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.annotation.Id;

@Edge("MeasurementsOrFacts")
public class MeasurementOrFactBucket<T> {

    @Id // db document field: _key
    private String id;

    @ArangoId // db document field: _id
    private String arangoId;

    @From
    private Variable variable;

    @To
    private Cenote cenote;

    private Instant firstTimestamp;
    private Instant lastTimestamp;

    private int count;
    private List<MeasurementOrFact<T>> measurements;

    public MeasurementOrFactBucket() {}

    public <T> MeasurementOrFactBucket(Cenote cenote, Variable variable) {
        this.variable = variable;
        this.cenote = cenote;
        this.measurements = new ArrayList<>();
        this.count = 0;
    }

    public void addMof(MeasurementOrFact mof){
        if(measurements.contains(mof))
            return;

        measurements.add(mof);
        count++;
        setFirstTimestamp(mof.getTimestamp());
        setLastTimestamp(mof.getTimestamp());
    }

    public void deleteMof(MeasurementOrFact mof){
        measurements.remove(mof);
        if(mof.getTimestamp().equals(firstTimestamp))
            setFirstTimestamp();
        if(mof.getTimestamp().equals(lastTimestamp))
            setLastTimestamp();
        count--;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getArangoId() {
        return arangoId;
    }

    public void setArangoId(String arangoId) {
        this.arangoId = arangoId;
    }

    public Instant getFirstTimestamp() {
        return firstTimestamp;
    }

    public void setFirstTimestamp(Instant firstTimestamp) {
        if (this.firstTimestamp == null) {
            this.firstTimestamp = firstTimestamp;
            return;
        }

        if (this.firstTimestamp.isAfter(firstTimestamp))
            this.firstTimestamp = firstTimestamp;
    }

    public void setFirstTimestamp() {
        firstTimestamp = measurements.get(0).getTimestamp();
        for(MeasurementOrFact mof : measurements){
            if(firstTimestamp.isAfter(mof.getTimestamp()))
                firstTimestamp = mof.getTimestamp();
        }
    }

    public Instant getLastTimestamp() {
        return lastTimestamp;
    }

    public void setLastTimestamp(Instant lastTimestamp) {
        if (this.lastTimestamp == null) {
            this.lastTimestamp = lastTimestamp;
            return;
        }

        if (this.lastTimestamp.isBefore(lastTimestamp))
            this.lastTimestamp = lastTimestamp;
    }

    public void setLastTimestamp() {
        lastTimestamp = measurements.get(0).getTimestamp();
        for(MeasurementOrFact mof : measurements){
            if(lastTimestamp.isBefore(mof.getTimestamp()))
                lastTimestamp = mof.getTimestamp();
        }
    }

    public int getCount() {
        return count;
    }

    public void increaseCount() {
        count++;
    }

    public List<MeasurementOrFact<T>> getMeasurements() {
        return measurements;
    }

    public void setMeasurements(List<MeasurementOrFact<T>> measurements) {
        this.measurements = measurements;
    }

    public String getVariable() {
        return variable.getArangoId();
    }

    public void setVariable(Variable variable) {
        this.variable = variable;
    }

    public String getCenote() {
        return cenote.getArangoId();
    }

    public void setCenote(Cenote cenote) {
        this.cenote = cenote;
    }
}
