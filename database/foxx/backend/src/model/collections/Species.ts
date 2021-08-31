import { Collection, Entities } from 'type-arango';
import { SpeciesDocument } from '../documents';

@Collection({
    of: SpeciesDocument,
})
export class Species extends Entities {
    static findByINaturalistId(iNaturalistId: string): SpeciesDocument {
        const q = {
            filter: {
                iNaturalistId,
            },
        };
        return Species.findOne(q);
    }

    static findByAphiaId(aphiaId: string): SpeciesDocument {
        const q = {
            filter: {
                aphiaId,
            },
        };
        return Species.findOne(q);
    }
}
