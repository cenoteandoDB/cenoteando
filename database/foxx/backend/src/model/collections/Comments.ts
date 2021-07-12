import { Collection, Entities } from 'type-arango';
import { QueryOpt } from 'type-arango/dist/types';

import { Comment } from '../documents';
import { Paginator } from '../../util/Paginator';

@Collection({
    of: Comment,
})
export class Comments extends Entities {
    static paginate(
        limit: number,
        continuationToken?: string,
        options?: QueryOpt,
    ): {
        data: Comment[];
        hasMore: boolean;
        continuationToken: string;
    } {
        const paginator = new Paginator<Comment>(Comments);
        return paginator.paginate(limit, continuationToken, options);
    }
}
