import { Attribute, Document, Entity, Index, Nested, Type } from 'type-arango';
import { Feature, Geometry } from 'geojson';

// TODO: Set role permissions (schema, readers, writers)
// TODO: Implement getters, setters and helpers

export enum Issue {
    GEOTAG_NOT_VERIFIED,
}

@Nested()
export class CenoteProperties {
    @Attribute()
    type: string;

    @Attribute()
    code: string;

    @Attribute()
    contact: string;

    @Attribute()
    alternative_names: Array<string>;

    @Attribute()
    createdAt: Type.DateInsert;

    @Attribute()
    updatedAt: Type.DateUpdate;

    @Attribute()
    issues: Array<Issue>;

    @Attribute()
    name: string;

    @Attribute()
    touristic: boolean;
}

@Document()
export class Cenote extends Entity implements Feature {
    @Index({
        type: 'geo',
    })
    @Attribute()
    geometry!: Geometry;

    @Attribute()
    properties!: CenoteProperties;

    @Attribute()
    type!: 'Feature';
}
