import { Collection, Entities } from 'type-arango';
import { QueryOpt } from 'type-arango/dist/types';

import { CommentBucket } from '../documents';
import { Paginator } from '../../util/Paginator';

@Collection({
    of: CommentBucket,
})
export class Comments extends Entities {
    static paginate(
        limit: number,
        continuationToken?: string,
        options?: QueryOpt,
    ): {
        data: CommentBucket[];
        hasMore: boolean;
        continuationToken: string;
    } {
        // TODO: Fix this for Comment bucket pattern
        throw Error('Not Implemented!');

        const paginator = new Paginator<CommentBucket>(Comments);
        return paginator.paginate(limit, continuationToken, options);
    }
}
