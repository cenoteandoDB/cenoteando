import createRouter from '@arangodb/foxx/router';
import { UserService } from '../services';
import { Joi } from 'type-arango';
import dd from 'dedent';

export default (): Foxx.Router => {
    const router = createRouter();

    // TODO: Test this
    router
        .post('/login', (req, res) => {
            try {
                const user = UserService.verifyUser(
                    req.body.email,
                    req.body.password,
                );

                req.session = {
                    uid: user._key!,
                    created: Date.now(),
                    data: user,
                };

                res.send({
                    uid: req.session.uid,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                });
            } catch (e) {
                // TODO: Only catch InvalidCredentialsError
                if (e instanceof Error) res.throw('forbidden', e.message);
                else throw e;
            }
        })
        .body(
            Joi.object({
                email: Joi.string().email().required(),
                password: Joi.string().required(),
            }).required(),
            'The login details.',
        )
        .summary('Allows a user to login with an email and password')
        .description(
            dd`
                Allows a user to login with an email and password. \
                This endpoint will always respond with 200 OK.
                If the user logs in successfully, some user data will be returned. \
                Otherwise a descriptive error message will be returned.
            `,
        )
        .response(
            'ok',
            Joi.object({
                uid: Joi.string().required(),
                name: Joi.string().required(),
                email: Joi.string().required(),
                role: Joi.string().required(),
            }).required(),
            ['application/json'],
            'The user was logged in successfully. X-Session-Id header contains the authentication token.',
        )
        .error(
            'forbidden',
            'The user was not logged in due to invalid credentials. A descriptive error message is returned.',
        );

    // TODO: Test this
    router
        .post('/register', (req, res) => {
            if (req.session && req.session.uid) {
                res.throw('forbidden', 'User already logged in.');
                return;
            }

            if (UserService.userExists(req.body.email)) {
                res.throw('forbidden', 'User with same email already exists.');
                return;
            }

            const user = UserService.createUser({
                email: req.body.email,
                name: req.body.name,
                password: req.body.password,
            });

            req.session = {
                uid: user._key!,
                created: Date.now(),
                data: user,
            };
        })
        .body(
            Joi.object({
                name: Joi.string().required(),
                email: Joi.string().email().required(),
                password: Joi.string()
                    .min(8)
                    .required()
                    .error((errors) => {
                        errors.map((err) => {
                            switch (err.type) {
                                case 'string.base':
                                    return {
                                        message: `Password must be a string`,
                                    };
                                case 'string.empty':
                                    return {
                                        message: `Password cannot empty`,
                                    };
                                case 'string.min':
                                    return {
                                        message: `Password should have at least {#limit} characters`,
                                    };
                                case 'any.required':
                                    return {
                                        message: `Password is required`,
                                    };
                                default:
                                    return err;
                            }
                        });
                        return errors;
                    }),
            }).required(),
            'The registration details.',
        )
        .summary('Allows a user to register with a name, email and password.')
        .description(
            dd`
                Allows a user to register in our platform with a name, email and password.
                If the user registers successfully, it will be automatically logged in, otherwise a descriptive error message will be returned.
            `,
        )
        .response(
            'ok',
            Joi.object({
                uid: Joi.string().required(),
                name: Joi.string().required(),
                email: Joi.string().required(),
                role: Joi.string().required(),
            }).required(),
            ['application/json'],
            'The user was registered and logged in successfully. X-Session-Id header contains the authentication token.',
        )
        .response(
            'forbidden',
            'User already logged in or the email provided is already being used. User is not registered.',
        );

    // TODO: Documentation
    // TODO: Test this
    router.get('/me', (req, res) => {
        let name = 'anonymous';
        if (req.session && req.session.data) name = req.session.data.name;
        res.send({ message: `Hello ${name}!` });
    });

    return router;
};
