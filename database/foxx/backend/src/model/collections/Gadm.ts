import { Collection, Entities } from 'type-arango';
import { GadmDocument } from '../documents';

@Collection({
    of: GadmDocument,
    routes: [
        { method: 'GET', roles: ['guest'] },
        { method: 'LIST', roles: ['guest'] },
    ],
})
export class Gadm extends Entities {}
