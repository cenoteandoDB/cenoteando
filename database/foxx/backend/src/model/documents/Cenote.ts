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
import { GadmDocument } from './GadmDocument';
import { Comment } from './Comment';

// TODO: Set role permissions (schema, readers, writers)
// TODO: Implement getters, setters and helpers

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

export enum Issue {
    GEOTAG_NOT_VERIFIED,
}

@Nested()
export class Social {
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
    type: string;

    @Attribute()
    name: string;

    @Attribute()
    touristic: boolean;

    @Attribute()
    issues: Array<Issue>;

    @Attribute()
    contacts: Array<string>;

    @Attribute()
    alternative_names: Array<string>;

    @Attribute()
    geojson: CenoteGeoJSON;

    @Attribute()
    @OneToOne((type) => GadmDocument)
    gadm: Related<GadmDocument>;

    @Attribute()
    social: Social;

    @Attribute()
    createdAt: Type.DateInsert;

    @Attribute()
    updatedAt: Type.DateUpdate;
}
