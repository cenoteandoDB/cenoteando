import {
    Attribute,
    Before,
    Document,
    Entity,
    Index,
    OneToMany,
    Related,
} from 'type-arango';
import bcrypt from 'bcrypt';

import { UserGroup } from './UserGroup';

const SALT_ROUNDS = 10;

export enum UserType {
    CENOTERO,
    OWNER,
    REGIONAL_MANAGER,
    THEMATIC_MANAGER,
    ADMIN,
}

@Document()
export class User extends Entity {
    @Index('hash')
    @Attribute()
    email: string;

    @Attribute()
    @Before.insert(User.hashPassword)
    password: string;

    @Attribute()
    type: UserType;

    @Attribute()
    @OneToMany((type) => UserGroup, (UserGroup) => UserGroup.users)
    groups: Related<UserGroup[]>;

    // TODO: Custom permissions per user

    private static hashPassword(password: string): string {
        return bcrypt.hashSync(password, SALT_ROUNDS);
    }

    validPassword(password: string): boolean {
        return bcrypt.compareSync(password, this.password);
    }

    isAdmin(): boolean {
        return this.type == UserType.ADMIN;
    }
}
