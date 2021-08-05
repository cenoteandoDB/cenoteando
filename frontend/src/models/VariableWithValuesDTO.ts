import VariableDTO from '@/models/VariableDTO';

export type VariableValueType = boolean | number | string;

export default class VariableWithValuesDTO {
    variable!: VariableDTO;
    values!: Array<{ timestamp: string; value: VariableValueType }>;

    constructor(jsonObj?: VariableWithValuesDTO) {
        if (jsonObj) {
            this.variable = new VariableDTO(jsonObj.variable);
            this.values = jsonObj.values;
        }
    }
}
