import { Feature, Geometry } from 'geojson';

interface CenoteSocialProperties {
    rating: number;
    comments: Array<CenoteComment>;
}

// TODO: Create CommentDTO and get from backend
interface CenoteComment {
    rating: number;
    source: string;
    text: string;
    timestamp: string;
    url: string;
}

export default class CenoteDTO implements Feature {
    geometry!: Geometry;
    properties!: {
        type: string;
        code: string;
        contact: string;
        alternative_names: Array<string>;
        createdAt: string;
        updatedAt: string;
        issues: Array<string>;
        name: string;
        touristic: boolean;
        social?: CenoteSocialProperties;
    };
    type!: 'Feature';

    constructor(jsonObj?: CenoteDTO) {
        if (jsonObj) {
            this.geometry = jsonObj.geometry;
            this.properties = jsonObj.properties;
            this.type = jsonObj.type;
        }
    }
}
