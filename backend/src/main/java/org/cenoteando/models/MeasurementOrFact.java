package org.cenoteando.models;

public class MeasurementOrFact<T> {

  private String timestamp;
  private T value;

  public MeasurementOrFact(String timestamp, T value) {
    this.timestamp = timestamp;
    this.value = value;
  }

  public T getValue() {
    return value;
  }

  public String getTimestamp() {
    return timestamp;
  }
}
