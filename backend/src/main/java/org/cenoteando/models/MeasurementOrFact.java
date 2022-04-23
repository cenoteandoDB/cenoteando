package org.cenoteando.models;

import org.cenoteando.dtos.MofDto;

import java.time.Instant;
import java.util.Objects;

@SuppressWarnings("unchecked")
public class MeasurementOrFact<T> {

    private Instant timestamp;
    private T value;

    public MeasurementOrFact() {}

    public MeasurementOrFact(Instant timestamp, T value) {
        this.timestamp = timestamp;
        this.value = value;
    }

    public MeasurementOrFact(MofDto mofDto){
        this.timestamp = mofDto.getTimestamp();
        this.value = (T) mofDto.getValue();
    }

    public T getValue() {
        return value;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj == null || obj.getClass() != this.getClass()) {
            return false;
        }

        final MeasurementOrFact other = (MeasurementOrFact) obj;
        return this.value.equals(other.value) && this.timestamp.equals(other.timestamp);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value, timestamp);
    }
}
