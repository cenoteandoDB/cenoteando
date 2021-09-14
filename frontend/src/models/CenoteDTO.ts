import { GeoJSON } from 'geojson';

class CenoteSocialProperties {
    totalComments!: number;
    rating?: number;
}

export enum CenoteType {
    NO_TYPE = 'NO_TYPE',
    CENOTE = 'CENOTE',
    DRY_CAVE = 'DRY_CAVE',
    WATER_WELL = 'WATER_WELL',
    WATERY = 'WATERY',
}

export enum CenoteIssue {
    GEOTAG_NOT_VERIFIED = 'GEOTAG_NOT_VERIFIED',
}

export default class CenoteDTO {
    _key!: string;
    type!: CenoteType;
    name!: string;
    touristic!: boolean;
    issues!: Array<CenoteIssue>;
    alternativeNames!: Array<string>;
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
            this.alternativeNames = jsonObj.alternativeNames;
            this.geojson = jsonObj.geojson;
            this.gadm = jsonObj.gadm;
            this.social = jsonObj.social;
            this.createdAt = jsonObj.createdAt;
            this.updatedAt = jsonObj.updatedAt;
        }
    }
}
