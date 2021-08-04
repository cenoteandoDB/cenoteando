import { Collection, Entities } from 'type-arango';
import { QueryOpt } from 'type-arango/dist/types';

import { Cenote, Theme } from '../documents';
import { Paginator } from '../../util/Paginator';
import { query } from '@arangodb';
import { MeasurementsOrFacts } from './MeasurementsOrFacts';
import { Comments } from './Comments';

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

    static getData(
        cenoteKey: string,
        theme: Theme,
        limit: number,
        continuationToken?: string,
        options?: QueryOpt,
    ) {
        // TODO: Improve this with pagination
        return query`
        FOR mof IN ${MeasurementsOrFacts._db}
            FILTER mof._to == ${Cenotes.name + '/' + cenoteKey}
            COLLECT var = mof._from INTO mofs
            LET vardoc = DOCUMENT(var)
            FILTER vardoc.theme == ${theme}
            LET values = (
                FOR mof IN mofs
                    SORT mof.timestamp DESC
                    RETURN KEEP(mof.mof, "timestamp", "value")
            )
            RETURN MERGE(vardoc, { values: values })
        `.toArray();
    }

    static getComments(
        cenoteKey: string,
        limit: number,
        continuationToken?: string,
        options: QueryOpt = {},
    ) {
        const filter = { _key: cenoteKey };
        if (!options.filter) options['filter'] = filter;
        else options.filter = Object.assign(options.filter, filter);

        const paginator = new Paginator<Comment>(Comments);
        return paginator.paginate(limit, continuationToken, options);
    }
}
