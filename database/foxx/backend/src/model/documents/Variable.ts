import { Attribute, Document, Entity } from 'type-arango';

// TODO: Set attribute schema and role permissions (schema, readers, writers)
// TODO: Implement getters, setters and helpers

enum Theme {
    LOCATION = 'LOCATION',
    GEOREFERENCE = 'GEOREFERENCE',
    CULTURAL = 'CULTURAL',
    GEOMORPHOLOGY = 'GEOMORPHOLOGY',
    BIODIVERSITY = 'BIODIVERSITY',
    DISTURBANCE = 'DISTURBANCE',
    TOURISM = 'TOURISM',
    DIVING = 'DIVING',
    ORGANIZATION = 'ORGANIZATION',
    REGULATION = 'REGULATION',
    WATER = 'WATER',
    EVENT = 'EVENT',
}

enum AccessLevel {
    PUBLIC = 'PUBLIC',
    PRIVATE = 'PRIVATE',
    SENSITIVE = 'SENSITIVE',
}

@Document()
export class Variable extends Entity {
    @Attribute()
    name: string;

    @Attribute()
    description: string;

    // TODO: Create enum with types: boolean, string, enum, number, number with units (see npm package "safe-units")
    @Attribute()
    type: string;

    @Attribute()
    timeseries: boolean;

    @Attribute()
    access_level: AccessLevel;

    @Attribute()
    theme: Theme;
}
