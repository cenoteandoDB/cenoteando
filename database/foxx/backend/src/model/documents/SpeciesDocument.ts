import { Attribute, Document, Entity, Index, Joi, Type } from 'type-arango';

@Document()
export class SpeciesDocument extends Entity {
    @Attribute(Joi.string().empty(''))
    aphiaId: string | null;

    @Attribute(Joi.string().empty(''))
    iNaturalistId: string | null;

    // TODO: Add createdAt and updatedAt to database
    @Index('persistent')
    @Attribute()
    createdAt: Type.DateInsert;

    @Attribute()
    updatedAt: Type.DateUpdate;
}
