import { GeoJSON } from 'geojson';

class CenoteSocialProperties {
    total_comments!: number;
    rating?: number;
    comments?: Array<CenoteComment>;
}

export enum CenoteIssue {
    GEOTAG_NOT_VERIFIED,
}

// TODO: Create CommentDTO and get from backend
interface CenoteComment {
    rating: number;
    source: string;
    text: string;
    timestamp: string;
    url: string;
}

export default class CenoteDTO {
    _key!: string;
    type!: string;
    name!: string;
    touristic!: boolean;
    issues!: Array<CenoteIssue>;
    contacts!: Array<string>;
    alternative_names!: Array<string>;
    geojson!: GeoJSON;
    gadm!: string | GeoJSON;
    social!: CenoteSocialProperties;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(jsonObj?: CenoteDTO) {
        if (jsonObj) {
            this._key = jsonObj._key;
            this.type = jsonObj.type;
            this.name = jsonObj.name;
            this.touristic = jsonObj.touristic;
            this.issues = jsonObj.issues;
            this.contacts = jsonObj.contacts;
            this.alternative_names = jsonObj.alternative_names;
            this.geojson = jsonObj.geojson;
            this.gadm = jsonObj.gadm;
            this.social = jsonObj.social;
            this.createdAt = jsonObj.createdAt;
            this.updatedAt = jsonObj.updatedAt;
        }
    }
}
