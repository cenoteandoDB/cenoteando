import { GeoJsonProperties } from 'geojson';

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
    id!: string;
    type!: CenoteType;
    name!: string;
    touristic!: boolean;
    issues!: Array<CenoteIssue>;
    alternativeNames!: Array<string>;
    geojson!: {
        type: 'Feature';
        geometry: {
            type: 'Point';
            coordinates: [number, number];
        };
        properties: Record<string, unknown>;
    };
    gadm!: GeoJsonProperties;
    social!: CenoteSocialProperties;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(jsonObj?: CenoteDTO) {
        if (jsonObj) {
            this.id = jsonObj.id;
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

    getLatitude(): number | null {
        return this.geojson?.geometry.coordinates[1] || null;
    }

    getLongitude(): number | null {
        return this.geojson?.geometry.coordinates[0] || null;
    }

    setCoordinates(latitude: number, longitude: number): void {
        // TODO: Validate coordinates (Error handling)
        if (this.geojson?.geometry?.coordinates) {
            this.geojson.geometry.coordinates = [longitude, latitude];
        } else {
            this.geojson = {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [longitude, latitude],
                },
                properties: this.geojson?.properties || {},
            };
        }
    }
}
