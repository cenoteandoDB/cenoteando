import { Collection, Entities } from 'type-arango';
import { User } from '../documents';
import { QueryOpt } from 'type-arango/dist/types';
import { Paginator } from '../../util/Paginator';

@Collection({
    of: User,
})
export class Users extends Entities {
    static paginate(
        limit: number,
        continuationToken?: string,
        options?: QueryOpt,
    ): {
        data: User[];
        hasMore: boolean;
        continuationToken: string;
    } {
        const paginator = new Paginator<User>(Users);
        return paginator.paginate(limit, continuationToken, options);
    }
}
