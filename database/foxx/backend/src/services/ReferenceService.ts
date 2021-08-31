import { User } from '../model/documents';
import { QueryFilter } from 'type-arango/dist/types';
import { References } from '../model/collections';
import { Reference } from '../model/documents';
import { CsvImportExport } from '../util/CsvImportExport';

// An authenticated user
type AuthUser = User | null;

export class ReferenceService {
    static getReferences(
        _: AuthUser,
        filter?: QueryFilter,
    ): Readonly<Reference>[] {
        return References.find({
            filter,
        });
    }

    static getReferenceByKey(_: AuthUser, _key: string): Readonly<Reference> {
        return References.findOne({
            filter: { _key },
        });
    }

    // TODO: Implement this
    static createReference(user: AuthUser, data: any): Readonly<Reference> {
        // TODO: Check errors and return array with keys of variables with error and error message
        throw new Error('Not Implemented');
    }

    // TODO: Implement this
    static updateReference(
        user: AuthUser,
        _key: string,
        data: any,
    ): Readonly<Reference> {
        if (!user?.isAdmin())
            throw new Error(
                `ReferenceService.updateSpecies: User does not have update permissions. reference._key = ${_key}.`,
            );

        const species = References.findOne(_key);
        // TODO: Check same key
        // TODO: Check valid data
        species.merge(data);
        species.save();
        return species;
    }

    static deleteReference(user: AuthUser, _key: string): void {
        if (!user?.isAdmin())
            throw new Error(
                `ReferenceService.deleteSpecies: User does not have delete permissions. species._key = ${_key}.`,
            );

        const species = References.findOne(_key);
        species.remove();
    }

    static toCsv(_: AuthUser): string {
        const csvImporter = new CsvImportExport(References, Reference);
        return csvImporter.toCsv();
    }

    static fromCsv(user: AuthUser, csv: string): Readonly<Reference>[] {
        if (!user?.isAdmin())
            throw new Error(
                `ReferenceService.fromCsv: User does not have upload permissions.`,
            );
        const csvImporter = new CsvImportExport(References, Reference);
        return csvImporter.fromCsv(csv) as Readonly<Reference>[];
    }

    static keyToId(_key: string): string {
        return References._col.name + '/' + _key;
    }

    static idToKey(_id: string): string {
        const [, _key] = _id.split('/');
        return _key;
    }
}
