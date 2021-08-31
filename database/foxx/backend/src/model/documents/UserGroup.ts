import { Attribute, Document, Entity, OneToMany, Related } from 'type-arango';
import { User } from './User';

// TODO: Implement groups
@Document()
export class UserGroup extends Entity {
    @Attribute()
    name: string;

    @Attribute()
    @OneToMany((type) => User, (User) => User.groups)
    users: Related<User[]>;

    // TODO: Custom permissions per group
}
