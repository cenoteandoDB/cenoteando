import { Collection, Entities } from 'type-arango';
import { QueryOpt } from 'type-arango/dist/types';

import { Cenote } from '../documents';
import { Paginator } from '../../util/Paginator';
import { query } from '@arangodb';

@Collection({
    of: Cenote,
})
export class Cenotes extends Entities {
    static paginate(
        limit: number,
        continuationToken?: string,
        options?: QueryOpt,
    ): {
        data: Cenote[];
        hasMore: boolean;
        continuationToken: string;
    } {
        const paginator = new Paginator<Cenote>(Cenotes);
        return paginator.paginate(limit, continuationToken, options);
    }

    static getBounds(): {
        min: { lat: number; lng: number };
        max: { lat: number; lng: number };
    } {
        return query`
            FOR c IN ${Cenotes._col.db}
                COLLECT AGGREGATE minLat = MIN(c.geojson.geometry.coordinates[1]), minLng = MIN(c.geojson.geometry.coordinates[0]), maxLat = MAX(c.geojson.geometry.coordinates[1]), maxLng = MAX(c.geojson.geometry.coordinates[0])
                RETURN {
                    min: { lat: minLat, lng: minLng },
                    max: { lat: maxLat, lng: maxLng },
                }
        `.next();
    }
}
