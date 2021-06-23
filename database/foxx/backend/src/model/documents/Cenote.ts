import {
    Attribute,
    Document,
    Entity,
    Nested,
    OneToMany,
    OneToOne,
    Related,
    Type,
} from 'type-arango';
import { GeoJSON } from 'geojson';
import { GadmDocument } from './GadmDocument';
import { Event } from './Event';

// TODO: Set role permissions (schema, readers, writers)
// TODO: Implement getters, setters and helpers

export enum Issue {
    GEOTAG_NOT_VERIFIED,
}

@Nested()
export class Social {
    @Attribute()
    total_comments: number;

    @Attribute()
    rating: number;

    @Attribute()
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
    geojson: GeoJSON;

    @Attribute()
    @OneToOne((type) => GadmDocument)
    gadm: Related<GadmDocument>;

    @Attribute()
    social: Social;

    @Attribute()
    @OneToMany((type) => Event, (Event) => Event.cenote)
    events: Related<Event>;

    @Attribute()
    createdAt: Type.DateInsert;

    @Attribute()
    updatedAt: Type.DateUpdate;
}
