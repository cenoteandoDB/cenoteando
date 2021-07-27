import { Users } from '../model/collections';
import { User, UserType } from '../model/documents';
import { QueryFilter } from 'type-arango/dist/types';

// An authenticated user
type AuthUser = User | null;

export class UserService {
    // TODO: Identify functions needed for UserService

    private static createReadFilter(user: AuthUser): QueryFilter {
        let filter = {};
        // If user is not authenticated, restrict access by filtering on an unused property
        if (!user) filter['___not_allowed___'] = true;
        else if (user && user.type == UserType.ADMIN) filter = {};
        else filter['_key'] = user._key;
        return filter;
    }

    static verifyUser(email: string, password: string): User {
        const user = Users.findOne({ filter: { email } });
        if (!user) {
            throw new Error('Invalid email.');
        }
        if (!user.validPassword(password)) {
            throw new Error('Invalid password.');
        }
        return user;
    }

    static getUser(user: AuthUser, _key: string): User {
        const filter = UserService.createReadFilter(user);
        return Users.findOne(_key, { filter });
    }

    static getUsers(user: AuthUser, _key: string): User[] {
        const filter = UserService.createReadFilter(user);
        return Users.find({ filter });
    }

    static createUser({ email, name, password }): User {
        // TODO: Check for already existing accounts
        const user = new User({
            email,
            name,
            password,
            type: UserType.CENOTERO,
        });
        user.insert();
        return user;
    }

    static userExists(email: string): boolean {
        try {
            const user = Users.findOne({
                filter: { email },
            });
            return user as boolean;
        } catch (e) {
            return false;
        }
    }
}
