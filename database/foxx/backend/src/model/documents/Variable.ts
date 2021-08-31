import { Attribute, Document, Entity, Index, Type } from 'type-arango';

export enum Theme {
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

    // TODO: Fix data type
    // TODO: Create enum with types: boolean, string, enum, number, number with units (see npm package "safe-units")
    @Attribute()
    type: string;

    // TODO: Fix timeseries
    @Attribute()
    timeseries: boolean;

    // TODO: Fix multiple
    @Attribute()
    multiple: boolean;

    // TODO: Fix access levels
    @Attribute()
    accessLevel: AccessLevel;

    @Attribute()
    theme: Theme;

    @Index('persistent')
    @Attribute()
    createdAt: Type.DateInsert;

    @Attribute()
    updatedAt: Type.DateUpdate;
}
