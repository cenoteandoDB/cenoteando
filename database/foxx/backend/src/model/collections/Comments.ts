import { Collection, Entities } from 'type-arango';
import { Comment } from '../documents';

@Collection({
    of: Comment,
    routes: [
        { method: 'GET', roles: ['guest'] },
        { method: 'LIST', roles: ['guest'] },
    ],
})
export class Comments extends Entities {}
