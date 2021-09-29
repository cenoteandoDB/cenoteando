import { QueryFilter } from 'type-arango/dist/types';

import { Cenotes } from '../model/collections';
import { Cenote, CommentBucket, User } from '../model/documents';
import { CsvImportExport } from '../util/CsvImportExport';

// An authenticated user
type AuthUser = User | null;

export class CenoteService {
    private static createReadFilter(user: AuthUser): QueryFilter {
        const filter = {};
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

    static getCenote(user: AuthUser, _key: string): Readonly<Cenote> {
        return Cenotes.findOne(_key, {
            filter: this.createReadFilter(user),
        });
    }

    // TODO: Implement this
    static createCenote(user: AuthUser, data: never): Readonly<Cenote> {
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

        let cenote = Cenotes.findOne(_key);
        // TODO: Throw error if not found
        if (!cenote) cenote = new Cenote();
        // TODO: Check same key
        // TODO: Check valid data
        // TODO: Throw error with details

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
        const csvImporter = new CsvImportExport(Cenotes, Cenote);
        return csvImporter.toCsv({
            filter: this.createReadFilter(user),
        });
    }

    static fromCsv(user: AuthUser, csv: string): Readonly<Cenote>[] {
        if (!user?.isAdmin())
            throw new Error(
                `CenoteService.fromCsv: User does not have upload permissions.`,
            );
        const csvImporter = new CsvImportExport(Cenotes, Cenote);
        return csvImporter.fromCsv(csv) as Readonly<Cenote>[];
    }

    static getBounds(): {
        min: { lat: number; lng: number };
        max: { lat: number; lng: number };
    } {
        return Cenotes.getBounds();
    }

    // TODO: Change return type to allow for different sources / multiple buckets
    static listComments(user: AuthUser, _key: string): Readonly<CommentBucket> {
        return Cenotes.getComments(_key, {
            filter: this.createReadFilter(user),
        });
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
