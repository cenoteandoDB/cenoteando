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
import { GadmDocument } from './GadmDocument';

// TODO: Set role permissions (schema, readers, writers)
// TODO: Implement getters, setters and helpers

@Nested()
export class CenoteGeoJSON implements Feature {
    @Attribute()
    type: 'Feature';

    // TODO: Fix geo index (use geojson mode).
    //  See https://teambrookvale.com.au/articles/modifying-npm-packages-the-right-way for fixing 'type-arango'
    @Index({ type: 'geo' })
    @Attribute()
    geometry: Geometry;

    @Attribute()
    properties: {};
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

    // TODO: OneToMany
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
