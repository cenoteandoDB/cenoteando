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
    @Route.GET('coastline', ['guest'], 'Returns all states')
    static GET_COASTLINE(): Feature {
        return Gadm.findOne('MEX');
    }

    @Route.GET('states', ['guest'], 'Returns all states')
    static GET_STATES(): FeatureCollection {
        const q = {
            filter: {
                'properties.ENG_TYPE1': 'State',
            },
        };
        return {
            type: 'FeatureCollection',
            features: Gadm.find(q),
        };
    }

    @Route.GET('municipalities', ['guest'], 'Returns all municipalities')
    static GET_MUNICIPALITIES(): FeatureCollection {
        const q = {
            filter: {
                'properties.ENG_TYPE2': 'Municipality',
            },
        };
        return {
            type: 'FeatureCollection',
            features: Gadm.find(q),
        };
    }
}
