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

export enum VariableType {
    STRING = 'STRING',
    BOOLEAN = 'BOOLEAN',
    UNITLESS_NUMBER = 'UNITLESS_NUMBER',
    NUMBER_WITH_UNITS = 'NUMBER_WITH_UNITS',
    ENUM = 'ENUM',
    NO_TYPE = 'NO_TYPE',
}

@Document()
export class Variable extends Entity {
    @Attribute()
    name: string;

    @Attribute()
    description: string;

    // TODO: Fix data type
    @Attribute()
    type: VariableType;

    // Use units compatible with the node.js package "safe-units"
    @Attribute()
    units: string;

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
