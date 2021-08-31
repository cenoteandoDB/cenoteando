import {
    Attribute,
    Document,
    Entity,
    Index,
    Nested,
    OneToOne,
    Related,
    Type,
} from 'type-arango';
import { Feature, Geometry } from 'geojson';
import { GadmDocument } from '.';

export enum Issue {
    GEOTAG_NOT_VERIFIED = 'GEOTAG_NOT_VERIFIED',
}

export enum CenoteType {
    NO_TYPE = 'NO_TYPE',
    CENOTE = 'CENOTE',
    DRY_CAVE = 'DRY_CAVE',
    WATER_WELL = 'WATER_WELL',
    WATERY = 'WATERY',
}

@Nested()
export class CenoteGeoJSON implements Feature {
    @Attribute()
    type: 'Feature';

    @Index({ type: 'geo', geojson: true })
    @Attribute()
    geometry: Geometry;

    @Attribute()
    properties: Record<string, never>;
}

@Nested()
export class Social {
    @Attribute()
    totalComments: number;

    @Attribute()
    rating: number | null;
}

@Document()
export class Cenote extends Entity {
    @Attribute()
    type: CenoteType;

    @Attribute()
    name: string;

    @Attribute()
    touristic: boolean;

    @Attribute()
    issues: Array<Issue>;

    @Attribute()
    alternativeNames: Array<string>;

    @Attribute()
    geojson: CenoteGeoJSON;

    @Attribute()
    @OneToOne((type) => GadmDocument)
    gadm: Related<GadmDocument>;

    @Attribute()
    social: Social;

    @Index('persistent')
    @Attribute()
    createdAt: Type.DateInsert;

    @Attribute()
    updatedAt: Type.DateUpdate;
}
