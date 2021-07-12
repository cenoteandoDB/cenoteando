import { Attribute, Document, Entity, Index, Nested } from 'type-arango';
import { Feature, Geometry } from 'geojson';

@Nested()
export class GadmProperties {
    @Attribute()
    GID_0!: string;

    @Attribute()
    NAME_0!: string;

    @Attribute()
    GID_1?: string;

    @Attribute()
    NAME_1?: string;

    @Attribute()
    VARNAME_1?: string;

    @Attribute()
    NL_NAME_1?: string;

    @Attribute()
    TYPE_1?: string;

    @Attribute()
    ENGTYPE_1?: string;

    @Attribute()
    CC_1?: string;

    @Attribute()
    HASC_1?: string;

    @Attribute()
    GID_2?: string;

    @Attribute()
    NAME_2?: string;

    @Attribute()
    VARNAME_2?: string;

    @Attribute()
    NL_NAME_2?: string;

    @Attribute()
    TYPE_2?: string;

    @Attribute()
    ENGTYPE_2?: string;

    @Attribute()
    CC_2?: string;

    @Attribute()
    HASC_2?: string;
}

@Document()
export class GadmDocument extends Entity implements Feature {
    @Index({ type: 'geo', geojson: true })
    @Attribute()
    geometry!: Geometry;

    @Attribute()
    properties!: GadmProperties;

    @Attribute()
    type!: 'Feature';
}
