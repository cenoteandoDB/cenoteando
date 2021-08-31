import { Collection, Entities } from 'type-arango';
import { Reference } from '../documents';

@Collection({
    of: Reference,
})
export class References extends Entities {}
