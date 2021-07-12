import { Collection, Entities } from 'type-arango';
import { UserGroup } from '../documents';

@Collection({
    of: UserGroup,
})
export class UserGroups extends Entities {}
