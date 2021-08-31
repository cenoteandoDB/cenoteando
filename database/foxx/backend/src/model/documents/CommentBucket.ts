import { Attribute, Document, Entity, Index, Nested } from 'type-arango';

export enum CommentSource {
    GOOGLE_PLACES = 'GOOGLE_PLACES',
    TRIPADVISOR = 'TRIPADVISOR',
}

@Nested()
export class Comment {
    @Attribute()
    rating: number;

    @Attribute()
    text: string;

    @Attribute()
    timestamp: Date;
}

@Document()
export class CommentBucket extends Entity {
    @Index('persistent')
    @Attribute()
    cenoteId: string;

    @Attribute()
    source: CommentSource;

    @Attribute()
    url: string;

    @Attribute()
    count: number;

    @Attribute()
    sumRating: number;

    @Attribute()
    comments: Comment[];
}
