import { Attribute, Document, Entity, Index, Type } from 'type-arango';

@Document()
export class SpeciesDocument extends Entity {
    @Attribute()
    aphiaId: string;

    @Attribute()
    iNaturalistId: string;

    // TODO: Add createdAt and updatedAt to database
    @Index('persistent')
    @Attribute()
    createdAt: Type.DateInsert;

    @Attribute()
    updatedAt: Type.DateUpdate;
}
