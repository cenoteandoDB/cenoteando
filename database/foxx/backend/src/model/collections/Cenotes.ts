import { Collection, Entities } from 'type-arango';
import { QueryOpt } from 'type-arango/dist/types';

import { Cenote } from '../documents';
import { Paginator } from '../../util/Paginator';

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
}
