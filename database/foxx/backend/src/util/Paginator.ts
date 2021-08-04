import { Entities } from 'type-arango';
import { QueryOpt } from 'type-arango/dist/types';

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

        if (continuationToken) {
            token = JSON.parse(
                Buffer.from(continuationToken, 'base64').toString(),
            );
            if (!options.filter) options['filter'] = {};
            options['filter'][
                '_customFilter'
            ] = `i.createdAt > '${token.timestamp}' OR (i.createdAt == '${token.timestamp}' AND i._key > '${token.id}')`;
        }

        options = {
            ...options,
            limit: limit + 1, // Using +1 to verify hasMore flag
            sort: ['createdAt ASC', '_key ASC'],
        };

        let data = this.col.find(options);
        const hasMore = data.length > limit;
        data = data.slice(0, limit);

        if (data.length > 0) {
            const last = data[data.length - 1];
            continuationToken = Buffer.from(
                JSON.stringify({
                    timestamp: last.createdAt,
                    id: last._key,
                }),
            ).toString('base64');
        } else if (!continuationToken)
            continuationToken = Buffer.from(
                JSON.stringify({
                    timestamp: new Date().toISOString(),
                    id: '',
                }),
            ).toString('base64');

        return {
            data,
            hasMore,
            continuationToken,
        };
    }
}
