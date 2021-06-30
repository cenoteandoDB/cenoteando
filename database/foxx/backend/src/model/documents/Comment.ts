import { Attribute, Document, Entity, Index } from 'type-arango';

// TODO: Set attribute schema and role permissions (schema, readers, writers)
// TODO: Implement getters, setters and helpers

export enum CommentSource {
    GOOGLE_PLACES = 'GOOGLE_PLACES',
    TRIPADVISOR = 'TRIPADVISOR',
}

@Document()
export class Comment extends Entity {
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
