import { Collection, Entities, Route } from 'type-arango';
import { Variable } from '../documents';
import { parse } from 'json2csv';
import { string } from 'joi';

@Collection({
    of: Variable,
    routes: [
        { method: 'GET', roles: ['guest'] },
        { method: 'LIST', roles: ['guest'] },
    ],
})
export class Variables extends Entities {
    @Route.GET(
        '/variables.csv',
        ['guest'],
        'Returns all variables in csv format',
        {
            response: {
                mime: ['text/csv'],
                schema: string(),
                status: 'ok',
            },
        },
    )
    static CSV(): string {
        const vars = Variables.find();
        return parse(vars, { eol: '\n' });
    }
}
