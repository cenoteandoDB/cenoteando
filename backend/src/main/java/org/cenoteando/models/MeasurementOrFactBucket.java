package org.cenoteando.models;

import com.arangodb.springframework.annotation.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Persistent;

import java.util.Date;
import java.util.List;



@Edge("MeasurementsOrFacts")
public class MeasurementOrFactBucket<T> {

    @Id // db document field: _key
    private String id;

    @ArangoId // db document field: _id
    private String arangoId;

    @From
    private Variable _from;

    @To
    private Cenote _to;

    //TODO Date parse error
    private String firstTimestamp;
    private String lastTimestamp;
    private int count;
    private List<MeasurementOrFact<T>> measurements;

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

    public String getFirstTimestamp() {
        return firstTimestamp;
    }

    public void setFirstTimestamp(String firstTimestamp) {
        this.firstTimestamp = firstTimestamp;
    }

    public String getLastTimestamp() {
        return lastTimestamp;
    }

    public void setLastTimestamp(String lastTimestamp) {
        this.lastTimestamp = lastTimestamp;
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }

    public List<MeasurementOrFact<T>> getMeasurements() {
        return measurements;
    }

    public void setMeasurements(List<MeasurementOrFact<T>> measurements) {
        this.measurements = measurements;
    }


    public String get_from() {
        return _from.getArangoId();
    }

    public void setVariable(Variable variable) {
        this._from = variable;
    }

    public String get_to() {
        return _to.getArangoId();
    }

    public void set_to(Cenote cenote) {
        this._to = cenote;
    }
}
