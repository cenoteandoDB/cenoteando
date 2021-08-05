import { QueryFilter } from 'type-arango/dist/types';

import { Cenotes } from '../model/collections';
import { Cenote, User } from '../model/documents';

// An authenticated user
type AuthUser = User | null;

export class CenoteService {
    private static createReadFilter(user: AuthUser): QueryFilter {
        let filter = {};
        if (!user) filter['touristic'] = true;
        return filter;
    }

    static listCenotes(
        user: AuthUser,
        limit = 250,
        continuationToken?: string,
    ): {
        data: Readonly<Cenote>[];
        hasMore: boolean;
        continuationToken: string;
    } {
        return Cenotes.paginate(limit, continuationToken, {
            filter: this.createReadFilter(user),
        });
    }

    static getCenote(user: AuthUser, _key: string): Cenote {
        return Cenotes.findOne(_key, {
            filter: this.createReadFilter(user),
        });
    }

    // TODO: Implement this
    static createCenote(user: AuthUser, data: never): Cenote {
        throw new Error('Not Implemented');
    }

    // TODO: Implement this
    static updateCenote(user: AuthUser, _key: string, data: never): Cenote {
        throw new Error('Not Implemented');
    }

    // TODO: Implement this
    static deleteCenote(user: AuthUser, _key: string): Cenote {
        throw new Error('Not Implemented');
    }

    static getBounds(): {
        min: { lat: number; lng: number };
        max: { lat: number; lng: number };
    } {
        return Cenotes.getBounds();
    }

    static keyToId(_key: string): string {
        return Cenotes._col.name + '/' + _key;
    }

    static idToKey(_id: string): string {
        const [, _key] = _id.split('/');
        return _key;
    }

    static hasAccess(user: AuthUser, _key: string): boolean {
        return !!CenoteService.getCenote(user, _key);
    }
}
