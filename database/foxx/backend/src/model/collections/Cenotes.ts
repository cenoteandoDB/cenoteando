import { Collection, Entities, Joi, Route, RouteArg } from 'type-arango';
import { Cenote, MeasurementOrFact } from '../documents';
import { query } from '@arangodb';
import { QueryOpt } from 'type-arango/dist/types';
import { MeasurementsOrFacts } from './MeasurementsOrFacts';
import { Variables } from './Variables';

@Collection({
    of: Cenote,
    relations: ['gadm'],
})
export class Cenotes extends Entities {
    @Route.GET(
        '',
        {
            // FIXME: Query parameter Documentation
            queryParams: [
                [
                    'limit',
                    Joi.number().min(1),
                    '**#️⃣ Limit results**\n　    `Example: ?limit=100`',
                ],
                [
                    'offset',
                    Joi.number().default(0),
                    '**⏭️ Skip results**\n　    `Example: ?offset=25`',
                ],
                [
                    'sort',
                    Joi.any().valid(...Object.keys(Cenote._doc.schema)),
                    '**🔀 Sort results by attribute**\n　    `Values: ' +
                        Object.keys(Cenote._doc.schema).join(', ') +
                        '`\n　    `Example: ?sort=' +
                        Object.keys(Cenote._doc.schema)[0] +
                        '`',
                ],
                [
                    'order',
                    Joi.any().valid('ASC', 'DESC').default('ASC'),
                    '**🔃 Order results**\n　    `Values: ASC, DESC`\n　    `Example: ?order=DESC`',
                ],
                [
                    '<any>',
                    Joi.any().valid(...Object.keys(Cenote._doc.schema)),
                    'Filter by attribute**\n　    `Example: ?_key=1`',
                ],
            ],
        },
        ['guest'],
        'Returns all touristic cenotes',
    )
    static LIST({ req }: RouteArg): Cenote[] {
        const { offset, limit, sort, order, ...filter } = req.queryParams;
        filter['touristic'] = true;

        const q: QueryOpt = {
            filter,
            sort: sort ? [sort + ' ' + (order || 'ASC')] : undefined,
            limit: offset ? [offset, limit] : limit,
        };

        return Cenotes.find(q);
    }

    @Route.GET(':_key', ['guest'], 'Returns a touristic cenote by key')
    static GET({ param }: RouteArg): Cenote {
        return Cenotes.findOne(param._key, {
            filter: { touristic: true },
        });
    }

    @Route.GET(
        ':_key/data/:theme',
        ['guest'],
        'Returns detailed cenote data by key and theme',
    )
    static GET_DATA({ param }: RouteArg): MeasurementOrFact<any>[] {
        // TODO: Test this
        return query`
            FOR var IN ${Variables._db}
                FILTER var.theme == ${param.theme}
                FOR mof IN ${MeasurementsOrFacts._db}
                    FILTER mof._from == ${Cenotes.name + '/' + param._key}
                    FILTER mof._to == var._id
                    RETURN MERGE(var, { values:  }
        `.next();
    }

    @Route.GET(
        'bounds',
        ['guest'],
        'Returns the boundaries for all touristic cenotes in format [[lat, lon], [lat, lon]]',
    )
    static GET_BOUNDS(): [[number, number], [number, number]] {
        return query`
            FOR c IN ${Cenotes._db}
                FILTER c.touristic == true
                COLLECT AGGREGATE 
                    minLat = MIN(c.geojson.geometry.coordinates[1]),
                    minLon = MIN(c.geojson.geometry.coordinates[0]),
                    maxLat = MAX(c.geojson.geometry.coordinates[1]),
                    maxLon = MAX(c.geojson.geometry.coordinates[0])
                RETURN { result: [[minLat, minLon], [maxLat, maxLon]] }
        `.next();
    }
}
