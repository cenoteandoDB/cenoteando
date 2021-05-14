import { Attribute, Document, Entity, Index } from 'type-arango';
import { Feature, Geometry } from 'geojson';

// TODO: Set attribute schema and role permissions (schema, readers, writers)
// TODO: Implement getters, setters and helpers

export class GadmProperties {
    @Attribute()
    GID_0: string;

    @Attribute()
    NAME_0: string;

    @Attribute()
    GID_1: string;

    @Attribute()
    NAME_1: string;

    @Attribute()
    NL_NAME_1: string;

    @Index((type) => 'hash')
    @Attribute()
    GID_2: string;

    @Attribute()
    NAME_2: string;

    @Attribute()
    VARNAME_2: string;

    @Attribute()
    NL_NAME_2: string;

    @Attribute()
    TYPE_2: string;

    @Attribute()
    ENGTYPE_2: string;

    @Attribute()
    CC_2: string;

    @Attribute()
    HASC_2: string;
}

@Document()
export class GadmDocument extends Entity implements Feature {
    @Index({
        type: 'geo',
    })
    @Attribute()
    geometry!: Geometry;

    @Attribute()
    properties!: GadmProperties;

    @Attribute()
    type!: 'Feature';
}
