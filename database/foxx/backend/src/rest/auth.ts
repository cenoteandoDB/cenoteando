import createRouter from '@arangodb/foxx/router';

export default (passport): Foxx.Router => {
    const router = createRouter();
    router.post('/login', passport.authenticate('local'));
    router.post('/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    });
    return router;
};
