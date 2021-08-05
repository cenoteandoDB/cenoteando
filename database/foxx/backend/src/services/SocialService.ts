import { Comments } from '../model/collections';
import { Comment, User } from '../model/documents';
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
        data: Readonly<Comment>[];
        hasMore: boolean;
        continuationToken: string;
    } {
        // Check access to cenote
        if (!CenoteService.hasAccess(user, cenoteKey))
            // TODO: Throw custom error
            throw Error(
                `SocialService.listComments: User does not have access to this cenote. cenote._key = ${cenoteKey}.`,
            );

        const filter = {
            cenote_id: CenoteService.keyToId(cenoteKey),
        };
        return Comments.paginate(limit, continuationToken, {
            filter,
        });
    }
}
