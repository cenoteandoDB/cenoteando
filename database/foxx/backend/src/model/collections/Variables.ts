import { Collection, Entities } from 'type-arango';

import { Variable } from '../documents';
import { Paginator } from '../../util/Paginator';
import { QueryOpt } from 'type-arango/dist/types';

@Collection({
    of: Variable,
})
export class Variables extends Entities {
    static paginate(
        limit: number,
        continuationToken?: string,
        options?: QueryOpt,
    ): {
        data: Variable[];
        hasMore: boolean;
        continuationToken: string;
    } {
        const paginator = new Paginator<Variable>(Variables);
        return paginator.paginate(limit, continuationToken, options);
    }
}
