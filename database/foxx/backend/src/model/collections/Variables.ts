import { Collection, Entities } from 'type-arango';
import { Variable } from '../documents';

@Collection({
    of: Variable,
    routes: [
        { method: 'GET', roles: ['guest'] },
        { method: 'LIST', roles: ['guest'] },
    ],
})
export class Variables extends Entities {}
