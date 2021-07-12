import { Users } from '../model/collections';
import { User } from '../model/documents';

// An authenticated user
// type AuthUser = User | null;

export class UserService {
    // TODO: Identify functions needed for UserService

    static passportVerifyLocal(email, password, done) {
        let user: User;
        try {
            user = Users.findOne({ filter: { email } });
        } catch (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, { message: 'Invalid email.' });
        }
        if (!user.validPassword(password)) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
    }
}
