import { Attribute, Edge, Entity } from 'type-arango';

// TODO: Set attribute schema and role permissions (schema, readers, writers)
// TODO: Implement getters, setters and helpers

@Edge()
export class MeasurementOrFact<T> extends Entity {
    @Attribute()
    timestamp: Date;

    @Attribute()
    value: T;
}
