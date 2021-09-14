import { Collection, Entities } from 'type-arango';

import { CommentBucket } from '../documents';

@Collection({
    of: CommentBucket,
})
export class Comments extends Entities {}
