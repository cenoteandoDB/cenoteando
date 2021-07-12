import { Collection, Entities } from 'type-arango';
import { GadmDocument } from '../documents';
import { Feature, FeatureCollection } from 'geojson';

@Collection({
    of: GadmDocument,
})
export class Gadm extends Entities {
    // TODO: Optimize (convert to polyline and only include yucatán peninsula)
    static coastline(): Feature {
        return Gadm.findOne('MEX');
    }

    // TODO: Optimize (only include Yucatán, Campeche and Quintana Roo)
    static states(): FeatureCollection {
        const q = {
            filter: {
                'properties.ENGTYPE_1': 'State',
            },
        };
        return {
            type: 'FeatureCollection',
            features: Gadm.find(q),
        };
    }

    // TODO: Optimize (only include Yucatán, Campeche and Quintana Roo)
    static municipalities(): FeatureCollection {
        const q = {
            filter: {
                'properties.ENGTYPE_2': 'Municipality',
            },
        };
        return {
            type: 'FeatureCollection',
            features: Gadm.find(q),
        };
    }
}
