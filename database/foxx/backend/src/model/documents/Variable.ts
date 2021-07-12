import { Attribute, Document, Entity } from 'type-arango';

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

export enum AccessLevel {
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

    // TODO: Make camelCase
    @Attribute()
    access_level: AccessLevel;

    @Attribute()
    theme: Theme;
}
