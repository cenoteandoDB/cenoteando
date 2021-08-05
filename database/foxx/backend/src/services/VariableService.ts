import { QueryFilter } from 'type-arango/dist/types';
import { parse } from 'json2csv';

import { Variables } from '../model/collections';
import { AccessLevel, User, Variable } from '../model/documents';

// An authenticated user
type AuthUser = User | null;

export class VariableService {
    private static createValueReadFilter(user: AuthUser): QueryFilter {
        const accessLevels: AccessLevel[] = [AccessLevel.PUBLIC];
        if (user) accessLevels.push(AccessLevel.PRIVATE);
        if (user && user.isAdmin()) accessLevels.push(AccessLevel.SENSITIVE);
        return {
            access_level: accessLevels,
        };
    }

    static listVariables(
        _: AuthUser,
        limit = 250,
        continuationToken?: string,
    ): {
        data: Readonly<Variable>[];
        hasMore: boolean;
        continuationToken: string;
    } {
        return Variables.paginate(limit, continuationToken);
    }

    static getVariable(_: AuthUser, _key: string): Readonly<Variable> {
        return Variables.findOne(_key);
    }

    static getVariables(
        user: AuthUser,
        filter: QueryFilter,
        filterValueReadAccess: boolean = false,
    ): Readonly<Variable>[] {
        filter = Object.assign(
            filter,
            filterValueReadAccess
                ? VariableService.createValueReadFilter(user)
                : {},
        );

        return Variables.find({
            filter,
        });
    }

    // TODO: Implement this
    static createVariable(user: AuthUser, data: never): Readonly<Variable> {
        throw new Error('Not Implemented');
    }

    // TODO: Implement this
    static updateVariable(
        user: AuthUser,
        _key: string,
        data: never,
    ): Readonly<Variable> {
        throw new Error('Not Implemented');
    }

    // TODO: Implement this
    static deleteVariable(user: AuthUser, _key: string): void {
        throw new Error('Not Implemented');
    }

    static csv(_: AuthUser): string {
        const vars = Variables.find();
        return parse(vars, { eol: '\n' });
    }

    static keyToId(_key: string): string {
        return Variables._col.name + '/' + _key;
    }

    static idToKey(_id: string): string {
        const [, _key] = _id.split('/');
        return _key;
    }
}
