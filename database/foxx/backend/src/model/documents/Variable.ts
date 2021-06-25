import { Attribute, Document, Entity } from 'type-arango';

// TODO: Set attribute schema and role permissions (schema, readers, writers)
// TODO: Implement getters, setters and helpers

enum Theme {
    LOCATION,
    GEOREFERENCE,
    CULTURAL,
    GEOMORPHOLOGY,
    BIODIVERSITY,
    DISTURBANCE,
    TOURISM,
    DIVING,
    ORGANIZATION,
    REGULATION,
    WATER,
    EVENT,
}

@Document()
export class Variable extends Entity {
    @Attribute()
    name: string;

    // TODO: Restrict to valid javascript keys
    // TODO: force unique in theme?
    @Attribute()
    field: string;

    @Attribute()
    description: string;

    // TODO: Create enum with types: boolean, string, enum, number, number with units (see npm package "safe-units")
    @Attribute()
    type: string;

    @Attribute()
    timeseries: boolean;

    // TODO: Create enum with public, non_sensitive and sensitive
    @Attribute()
    access_level: boolean;

    @Attribute()
    theme: Theme;
}
