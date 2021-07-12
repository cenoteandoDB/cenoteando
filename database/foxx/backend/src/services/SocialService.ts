import { Cenotes, Comments } from '../model/collections';
import { Comment, User } from '../model/documents';

// An authenticated user
type AuthUser = User | null;

export class SocialService {
    static listComments(
        user: AuthUser,
        cenoteKey: string,
        limit: number = 20,
        continuationToken?: string,
    ): {
        data: Readonly<Comment>[];
        hasMore: boolean;
        continuationToken: string;
    } {
        let filter = {};
        if (!user) filter['cenote_id'] = Cenotes.name + '/' + cenoteKey;
        return Comments.paginate(limit, continuationToken, {
            filter,
        });
    }
}
