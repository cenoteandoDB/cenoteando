import VariableDTO from '@/models/VariableDTO';
export type VariableValueType = boolean | number | string;

export default class MofDTO {
    cenoteId!: string;
    variableId!: string;
    timestamp!: string;
    value!: string;
    variable!: VariableDTO;
    values!: Array<{ timestamp: string; value: VariableValueType }>;

    constructor(jsonObj?: MofDTO) {
        if (jsonObj) {
            this.cenoteId = jsonObj.cenoteId;
            this.variableId = jsonObj.variableId;
            this.timestamp = jsonObj.timestamp;
            this.value = jsonObj.value;
            this.variable = new VariableDTO(jsonObj.variable);
            this.values = jsonObj.values;
        }
    }
}
