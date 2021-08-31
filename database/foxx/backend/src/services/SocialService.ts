import { Comments } from '../model/collections';
import { CommentBucket, User } from '../model/documents';
import { CenoteService } from './CenoteService';

// An authenticated user
type AuthUser = User | null;

export class SocialService {
    static listComments(
        user: AuthUser,
        cenoteKey: string,
        limit = 20,
        continuationToken?: string,
    ): {
        data: Readonly<CommentBucket>[];
        hasMore: boolean;
        continuationToken: string;
    } {
        // TODO: Fix this for Comment bucket pattern
        throw Error('Not Implemented!');

        // Check access to cenote
        if (!CenoteService.hasAccess(user, cenoteKey))
            // TODO: Throw custom error
            throw Error(
                `SocialService.listComments: User does not have access to this cenote. cenote._key = ${cenoteKey}.`,
            );

        const filter = {
            cenoteKey: CenoteService.keyToId(cenoteKey),
        };
        return Comments.paginate(limit, continuationToken, {
            filter,
        });
    }
}
