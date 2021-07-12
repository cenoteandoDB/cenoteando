import {
    Attribute,
    Document,
    Entity,
    Index,
    Nested,
    OneToMany,
    OneToOne,
    Related,
    Type,
} from 'type-arango';
import { Feature, Geometry } from 'geojson';
import { GadmDocument, Comment } from '.';

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
    // TODO: Make camelCase
    @Attribute()
    total_comments: number;

    @Attribute()
    rating?: number;

    @OneToMany((type) => Comment, (Comment) => Comment.cenote_id)
    comments: Related<Comment>;
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

    // TODO: Remove attribute (store as variable)
    @Attribute()
    contacts: Array<string>;

    // TODO: Make camelCase
    @Attribute()
    alternative_names: Array<string>;

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
