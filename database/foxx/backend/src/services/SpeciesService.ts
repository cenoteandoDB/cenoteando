import { User } from '../model/documents';
import { QueryFilter } from 'type-arango/dist/types';
import { Species } from '../model/collections';
import { SpeciesDocument } from '../model/documents';
import { CsvImportExport } from '../util/CsvImportExport';

// An authenticated user
type AuthUser = User | null;

export class SpeciesService {
    static getSpecies(
        _: AuthUser,
        filter?: QueryFilter,
    ): Readonly<SpeciesDocument>[] {
        return Species.find({
            filter,
        });
    }

    static getSpeciesByKey(
        _: AuthUser,
        _key: string,
    ): Readonly<SpeciesDocument> {
        return Species.findOne({
            filter: { _key },
        });
    }

    static getSpeciesByINaturalistId(
        _: AuthUser,
        iNaturalistId: string,
    ): Readonly<SpeciesDocument> {
        return Species.findByINaturalistId(iNaturalistId);
    }

    static getSpeciesByAphiaId(
        _: AuthUser,
        AphiaId: string,
    ): Readonly<SpeciesDocument> {
        return Species.findByAphiaId(AphiaId);
    }

    // TODO: Implement this
    static createSpecies(user: AuthUser, data: any): Readonly<Species> {
        // TODO: Check errors and return array with keys of variables with error and error message
        throw new Error('Not Implemented');
    }

    // TODO: Implement this
    static updateSpecies(
        user: AuthUser,
        _key: string,
        data: any,
    ): Readonly<Species> {
        if (!user?.isAdmin())
            throw new Error(
                `SpeciesService.updateSpecies: User does not have update permissions. species._key = ${_key}.`,
            );

        const species = Species.findOne(_key);
        // TODO: Check same key
        // TODO: Check valid data
        species.merge(data);
        species.save();
        return species;
    }

    static deleteSpecies(user: AuthUser, _key: string): void {
        if (!user?.isAdmin())
            throw new Error(
                `SpeciesService.deleteSpecies: User does not have delete permissions. species._key = ${_key}.`,
            );

        const species = Species.findOne(_key);
        species.remove();
    }

    static toCsv(_: AuthUser): string {
        const csvImporter = new CsvImportExport(Species, SpeciesDocument);
        return csvImporter.toCsv();
    }

    static fromCsv(user: AuthUser, csv: string): Readonly<SpeciesDocument>[] {
        if (!user?.isAdmin())
            throw new Error(
                `SpeciesService.fromCsv: User does not have upload permissions.`,
            );
        const csvImporter = new CsvImportExport(Species, SpeciesDocument);
        return csvImporter.fromCsv(csv) as Readonly<SpeciesDocument>[];
    }

    static keyToId(_key: string): string {
        return Species._col.name + '/' + _key;
    }

    static idToKey(_id: string): string {
        const [, _key] = _id.split('/');
        return _key;
    }
}
