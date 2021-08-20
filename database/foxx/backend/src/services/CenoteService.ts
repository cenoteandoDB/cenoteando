import { QueryFilter } from 'type-arango/dist/types';
import { parse } from 'json2csv';

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
    static updateCenote(
        user: AuthUser,
        _key: string,
        data: any,
    ): Readonly<Cenote> {
        if (!user?.isAdmin())
            throw new Error(
                `CenoteService.updateCenote: User does not have update permissions. cenote._key = ${_key}.`,
            );

        const cenote = Cenotes.findOne(_key);
        // TODO: Check same key
        // TODO: Check valid data
        cenote.merge(data);
        cenote.save();
        return cenote;
    }

    static deleteCenote(user: AuthUser, _key: string): void {
        if (!user?.isAdmin())
            throw new Error(
                `CenoteService.deleteCenote: User does not have delete permissions. cenote._key = ${_key}.`,
            );

        const cenote = Cenotes.findOne(_key);
        cenote.remove();
    }

    static toCsv(user: AuthUser): string {
        const cenotes = Cenotes.find({
            filter: this.createReadFilter(user),
        });
        return parse(cenotes, { eol: '\n' });
    }

    static fromCsv(user: AuthUser, csv: string): void {
        if (!user?.isAdmin())
            throw new Error(
                `CenoteService.fromCsv: User does not have upload permissions.`,
            );

        // TODO: Parse csv to json array
        const cenotes = [];
        // TODO: Try to make this operation atomic
        cenotes.forEach((data) => {
            CenoteService.createCenote(user, data);
        });
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
