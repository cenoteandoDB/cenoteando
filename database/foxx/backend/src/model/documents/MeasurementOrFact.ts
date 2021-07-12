import { Attribute, Edge, Entity } from 'type-arango';

// TODO: Implement bucket pattern (Collect MoFs in single document per cenote/variable pair)
export type ValueType = number | boolean | string;

@Edge()
export class MeasurementOrFact<T extends ValueType> extends Entity {
    @Attribute()
    timestamp: Date;

    @Attribute()
    value: ValueType;
}
