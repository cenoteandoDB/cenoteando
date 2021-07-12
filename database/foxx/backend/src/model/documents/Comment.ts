import { Attribute, Document, Entity, Index } from 'type-arango';

export enum CommentSource {
    GOOGLE_PLACES = 'GOOGLE_PLACES',
    TRIPADVISOR = 'TRIPADVISOR',
}

// TODO: Implement bucket pattern (collect comments in single document per cenote)
@Document()
export class Comment extends Entity {
    // TODO: Change to cenoteKey
    @Index('hash')
    @Attribute()
    cenote_id: string;

    @Attribute()
    rating: number;

    @Attribute()
    source: CommentSource;

    @Attribute()
    text: string;

    @Attribute()
    timestamp: Date;

    @Attribute()
    url: string;
}
