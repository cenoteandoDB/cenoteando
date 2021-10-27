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
}

export enum AccessLevel {
    PUBLIC = 'PUBLIC',
    PRIVATE = 'PRIVATE',
    SENSITIVE = 'SENSITIVE',
}

export enum VariableType {
    STRING = 'STRING',
    BOOLEAN = 'BOOLEAN',
    ENUM = 'ENUM',
    JSON = 'JSON',
    UNITLESS_NUMBER = 'UNITLESS_NUMBER',
    NUMBER_WITH_UNITS = 'NUMBER_WITH_UNITS',
    DATETIME = 'DATETIME',
    DATE = 'DATE',
    TIME = 'TIME',
    NO_TYPE = 'NO_TYPE',
}

export enum VariableOrigin {
    FIELD = 'FIELD',
    OFFICE = 'OFFICE',
    BOTH = 'BOTH',
}

@Document()
export class Variable extends Entity {
    @Attribute()
    name: string;

    @Attribute()
    description: string;

    @Attribute()
    type: VariableType;

    @Attribute()
    units: string | null;

    @Attribute()
    enumValues: string[] | null;

    @Attribute()
    timeseries: boolean;

    @Attribute()
    multiple: boolean;

    @Attribute()
    accessLevel: AccessLevel;

    @Attribute()
    theme: Theme;

    @Attribute()
    origin: VariableOrigin;

    @Attribute()
    methodology: string | null;

    @Index('persistent')
    @Attribute()
    createdAt: Type.DateInsert;

    @Attribute()
    updatedAt: Type.DateUpdate;
}
