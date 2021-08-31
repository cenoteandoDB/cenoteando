import { MeasurementsOrFacts } from '../model/collections';
import {
    MeasurementOrFact,
    User,
    ValueType,
    Variable,
} from '../model/documents';
import { CenoteService } from './CenoteService';
import { VariableService } from './VariableService';

// An authenticated user
type AuthUser = User | null;

export interface VariableValues {
    [variableKey: string]: {
        variable: Variable;
        values: MeasurementOrFact<ValueType>[];
    };
}

export class MoFService {
    static getData(user: AuthUser, cenoteKey, theme): VariableValues {
        // Check access to cenote
        if (!CenoteService.hasAccess(user, cenoteKey))
            // TODO: Throw custom error
            throw Error(
                `MoFService.getData: User does not have access to this cenote. cenote._key = ${cenoteKey}.`,
            );

        // Find all variables of theme to which values user has read access to
        const variables = VariableService.getVariables(user, { theme }, true);
        const variableIds = variables.map((v) =>
            VariableService.keyToId(v._key!),
        );

        // Map authorized variables found to key-value pairs
        let variablesMap = variables.reduce((acc, curr) => {
            acc[curr._key!] = {
                variable: curr,
                values: [],
            };
            return acc;
        }, {});

        // Find all MoFs by cenote/variable pair
        const mofs = MeasurementsOrFacts.find({
            filter: {
                _from: variableIds,
                _to: CenoteService.keyToId(cenoteKey),
            },
        });

        // Add values from MoFs to mapped variables
        mofs.forEach((mof) => {
            const variableKey = VariableService.idToKey(mof._from);
            if (!(variableKey in variablesMap)) return;
            variablesMap[variableKey].values.concat(mof.measurements);
        });

        // Delete variables without values
        Object.keys(variablesMap).forEach((key) => {
            if (variablesMap[key].values.length == 0) delete variablesMap[key];
        });

        return variablesMap;
    }

    static keyToId(_key: string): string {
        return MeasurementsOrFacts._col.name + '/' + _key;
    }

    static idToKey(_id: string): string {
        const [, _key] = _id.split('/');
        return _key;
    }
}
