import { Collection, Entities, Route } from 'type-arango';
import { GadmDocument } from '../documents';
import { FeatureCollection } from 'geojson';

@Collection({
    of: GadmDocument,
    routes: [
        { method: 'GET', roles: ['guest'] },
        { method: 'LIST', roles: ['guest'] },
    ],
})
export class Gadm extends Entities {
    // TODO: Import GADM level 0 (_key = 'MEX')
    @Route.GET('coastline', ['guest'], 'Returns all states')
    static GET_COASTLINE(): FeatureCollection {
        return {
            type: 'FeatureCollection',
            features: Gadm.findOne('MEX'),
        };
    }

    // TODO: Import GADM level 1 (_key = 'MEX.*')
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
