import { Attribute, Edge, Entity, Nested } from 'type-arango';

export type ValueType =
    | number
    | boolean
    | string
    | (number | boolean | string)[];

@Nested()
export class MeasurementOrFact<T extends ValueType> {
    @Attribute()
    timestamp: Date;

    @Attribute()
    value: T;
}

@Edge()
export class MeasurementOrFactBucket<T extends ValueType> extends Entity {
    @Attribute()
    firstTimestamp: Date;

    @Attribute()
    lastTimestamp: Date;

    @Attribute()
    count: number;

    @Attribute()
    measurements: MeasurementOrFact<T>[];
}
