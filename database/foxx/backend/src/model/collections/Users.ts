import { Collection, Entities } from 'type-arango';
import { User } from '../documents';

@Collection({
    of: User,
})
export class Users extends Entities {}
