import { Attribute, Document, Entity, Index, Type } from 'type-arango';

export enum ReferenceType {
    BOOK = 'BOOK',
    BOOK_CHAPTER = 'BOOK_CHAPTER',
    JOURNAL = 'JOURNAL',
    OTHER = 'OTHER',
    REPORT = 'REPORT',
    THESIS = 'THESIS',
    WEBPAGE = 'WEBPAGE',
}

@Document()
export class Reference extends Entity {
    @Attribute()
    authors: string;

    @Attribute()
    fileName: string;

    @Attribute()
    reference: string;

    @Attribute()
    shortName: string;

    @Attribute()
    type: ReferenceType;

    @Attribute()
    year: string;

    // TODO: Add createdAt and updatedAt to database
    @Index('persistent')
    @Attribute()
    createdAt: Type.DateInsert;

    @Attribute()
    updatedAt: Type.DateUpdate;
}
