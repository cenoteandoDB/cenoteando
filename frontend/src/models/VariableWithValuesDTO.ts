import VariableDTO from '@/models/VariableDTO';

export type VariableValueType = boolean | number | string;

export default class VariableWithValuesDTO {
    variable!: VariableDTO;
    values!: Array<{ timestamp: string; value: VariableValueType }>;
    cenoteId!: string;
    variableId!: string;
    timestamp!: string;
    value!: string;
    

    constructor(jsonObj?: VariableWithValuesDTO) {
        if (jsonObj) {
            this.variable = new VariableDTO(jsonObj.variable);
            this.values = jsonObj.values;
            this.cenoteId = jsonObj.cenoteId;
            this.variableId = jsonObj.variableId;
            this.timestamp = jsonObj.timestamp;
            this.value = jsonObj.value;
        }
    }
}
