import { Entities } from 'type-arango';
import { QueryOpt } from 'type-arango/dist/types';
import { aql, query } from '@arangodb';

export class Paginator<T> {
    col: typeof Entities;

    constructor(col: typeof Entities) {
        this.col = col;
    }

    paginate(
        limit: number,
        continuationToken?: string,
        options: QueryOpt = {},
    ): {
        data: T[];
        hasMore: boolean;
        continuationToken: string;
    } {
        // Timestamp_ID based configuration token (see https://phauer.com/2018/web-api-pagination-timestamp-id-continuation-token/)
        let token: {
            id: string;
            timestamp: string;
        };

        let filter = {};
        if (continuationToken) {
            token = JSON.parse(
                Buffer.from(continuationToken, 'base64').toString(),
            );
            filter = {
                createdAt: ['>', token.timestamp],
                _customFilter: aql.literal(
                    `i.createdAt > ${token.timestamp} OR (i.createdAt == ${token.timestamp} AND i._key > ${token.id})`,
                ),
            };
        }

        Object.assign(options.filter, filter);

        const data = this.col.find({
            ...options,
            limit,
            sort: ['createdAt ASC', '_key ASC'],
        });
        const last = data[data.length - 1];

        return {
            data,
            hasMore: query`
                FOR c IN ${this.col._db}
                    COLLECT AGGREGATE maxCreatedAt = MAX(c.createdAt), maxKey = MAX(c._key)
                    RETURN
                        maxCreatedAt > ${last.createdAt} OR 
                        (maxCreatedAt == ${last.createdAt} AND maxKey > ${last._key})
            `.next(),
            continuationToken: Buffer.from(
                JSON.stringify({
                    timestamp: last.createdAt,
                    id: last._key,
                }),
            ).toString('base64'),
        };
    }
}
