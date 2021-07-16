import createRouter from '@arangodb/foxx/router';
import { CenoteService } from '../services';

import createRouter from '@arangodb/foxx/router';

export default (passport): Foxx.Router => {
    const router = createRouter();

    router.get((req, res) => {
        const user = (req as Express.Request).user;
        CenoteService.listCenotes();
    });

    return router;
};
