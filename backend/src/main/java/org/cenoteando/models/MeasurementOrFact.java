package org.cenoteando.models;

import java.time.Instant;

public class MeasurementOrFact<T> {

    private Instant timestamp;
    private T value;

    public MeasurementOrFact(){}

    public MeasurementOrFact(Instant timestamp, T value) {
        this.timestamp = timestamp;
        this.value = value;
    }

    public T getValue() {
        return value;
    }

    public Instant getTimestamp() {
        return timestamp;
    }
}
