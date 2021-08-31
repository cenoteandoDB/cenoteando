import { genRandomBytes } from '@arangodb/crypto';
import {
    Attribute,
    Before,
    Document,
    Entity,
    Index,
    OneToMany,
    Related,
    Type,
} from 'type-arango';
import bcrypt from 'bcryptjs';

import { UserGroup } from './UserGroup';

// bcrypt setup
const SALT_ROUNDS = 10;
bcrypt.setRandomFallback(genRandomBytes);

export enum UserRole {
    CENOTERO = 'CENOTERO',
    OWNER = 'OWNER',
    REGIONAL_MANAGER = 'REGIONAL_MANAGER',
    THEMATIC_MANAGER = 'THEMATIC_MANAGER',
    ADMIN = 'ADMIN',
}

@Document()
export class User extends Entity {
    @Index({
        type: 'persistent',
        unique: true,
        deduplicate: true,
    })
    @Attribute()
    email: string;

    @Attribute()
    name: string;

    @Attribute((readers) => [])
    @Before.insert(User.hashPassword)
    password: string;

    @Attribute()
    role: UserRole;

    // TODO: Implement groups
    @Attribute()
    @OneToMany((type) => UserGroup, (UserGroup) => UserGroup.users)
    groups: Related<UserGroup[]>;

    @Index('persistent')
    @Attribute()
    createdAt: Type.DateInsert;

    @Attribute()
    updatedAt: Type.DateUpdate;

    // TODO: Custom permissions per user

    private static hashPassword(password: string): string {
        return bcrypt.hashSync(password, SALT_ROUNDS);
    }

    validPassword(password: string): boolean {
        return bcrypt.compareSync(password, this.password);
    }

    isAdmin(): boolean {
        return this.role == UserRole.ADMIN;
    }
}
