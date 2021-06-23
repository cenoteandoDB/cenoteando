import { Attribute, Edge, Entity } from 'type-arango';
import './Event';

// TODO: Set attribute schema and role permissions (schema, readers, writers)
// TODO: Implement getters, setters and helpers

enum MoFType {
    NUMBER,
    STRING,
    BOOLEAN,
}

@Edge()
export class MeasurementOrFact extends Entity {
    @Attribute()
    timestamp: Date;

    @Attribute()
    type: MoFType;

    @Attribute()
    value: number | string | boolean;
}
