import { Collection, Entities, Route } from 'type-arango';
import { GadmDocument } from '../documents';
import { Feature, FeatureCollection } from 'geojson';

@Collection({
    of: GadmDocument,
    routes: [
        { method: 'GET', roles: ['guest'] },
        { method: 'LIST', roles: ['guest'] },
    ],
})
export class Gadm extends Entities {
    // TODO: Fix Timeout
    @Route.GET('coastline', ['guest'], 'Returns the mexican coastline')
    static GET_COASTLINE(): Feature {
        return Gadm.findOne('MEX');
    }

    // TODO: Fix Timeout
    @Route.GET('states', ['guest'], 'Returns all states')
    static GET_STATES(): FeatureCollection {
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

    // TODO: Fix Timeout
    @Route.GET('municipalities', ['guest'], 'Returns all municipalities')
    static GET_MUNICIPALITIES(): FeatureCollection {
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
