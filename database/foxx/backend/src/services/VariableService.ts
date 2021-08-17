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
    static createVariable(user: AuthUser, data: any): Readonly<Variable> {
        // TODO: Check errors and return array with keys of variables with error and error message
        throw new Error('Not Implemented');
    }

    // TODO: Implement this
    static updateVariable(
        user: AuthUser,
        _key: string,
        data: any,
    ): Readonly<Variable> {
        if (!user?.isAdmin())
            throw new Error(
                `VariableService.updateVariable: User does not have update permissions. variable._key = ${_key}.`,
            );

        const variable = Variables.findOne(_key);
        // TODO: Check same key
        // TODO: Check valid data
        variable.merge(data);
        variable.save();
        return variable;
    }

    static deleteVariable(user: AuthUser, _key: string): void {
        if (!user?.isAdmin())
            throw new Error(
                `VariableService.deleteVariable: User does not have delete permissions. variable._key = ${_key}.`,
            );

        const variable = Variables.findOne(_key);
        variable.remove();
    }

    static toCsv(_: AuthUser): string {
        const vars = Variables.find();
        return parse(vars, { eol: '\n' });
    }

    static fromCsv(user: AuthUser, csv: string): void {
        if (!user?.isAdmin())
            throw new Error(
                `VariableService.fromCsv: User does not have upload permissions.`,
            );

        // TODO: Parse csv to json array
        const variables = [];
        // TODO: Try to make this operation atomic
        variables.forEach((data) => {
            VariableService.createVariable(user, data);
        });
    }

    static keyToId(_key: string): string {
        return Variables._col.name + '/' + _key;
    }

    static idToKey(_id: string): string {
        const [, _key] = _id.split('/');
        return _key;
    }
}
