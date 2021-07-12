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
        options?: QueryOpt,
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
            token = JSON.parse(atob(continuationToken));
            filter = {
                createdAt: ['>', token.timestamp],
                _customFilter: aql.literal(
                    `i.createdAt > ${token.timestamp} OR (i.createdAt == ${token.timestamp} AND i._id > ${token.id})`,
                ),
            };
        }

        const data = this.col.find({
            ...options,
            filter,
            limit,
            sort: ['createdAt ASC', '_id ASC'],
        });
        const last = data[data.length - 1];

        return {
            data,
            hasMore: query`
                FOR c IN ${this.col._db}
                    COLLECT AGGREGATE maxCreatedAt = MAX(c.createdAt), maxId = MAX(c._id)
                    RETURN
                        maxCreatedAt > ${last.createdAt} OR 
                        (maxCreatedAt == ${last.createdAt} AND maxId > ${last._id})
            `.next(),
            continuationToken: btoa(
                JSON.stringify({
                    timestamp: last.createdAt,
                    id: last._id,
                }),
            ),
        };
    }
}
