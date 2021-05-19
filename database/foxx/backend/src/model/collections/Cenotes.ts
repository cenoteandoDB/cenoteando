import { Collection, Entities, Route } from 'type-arango';
import { Cenote } from '../documents';
import { query } from '@arangodb';

@Collection({
    of: Cenote,
})
export class Cenotes extends Entities {
    @Route.GET('', ['guest'], 'Returns all touristic cenotes')
    static GET_PUBLIC(): Cenote[] {
        return Cenotes.find({ filter: { 'properties.touristic': true } });
    }

    @Route.GET(
        'bounds',
        ['guest'],
        'Returns the boundaries for all touristic cenotes in format [[lat, lon], [lat, lon]]',
    )
    static GET_BOUNDS(): [[number, number], [number, number]] {
        return query`
            FOR c IN ${Cenotes._db}
                FILTER c.properties.touristic == true
                COLLECT AGGREGATE 
                    minLat = MIN(c.geometry.coordinates[1]),
                    minLon = MIN(c.geometry.coordinates[0]),
                    maxLat = MAX(c.geometry.coordinates[1]),
                    maxLon = MAX(c.geometry.coordinates[0])
                RETURN { result: [[minLat, minLon], [maxLat, maxLon]] }
        `.next();
    }
}
