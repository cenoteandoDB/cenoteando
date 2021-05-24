import { Feature, Geometry } from 'geojson';

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
