export type VariableValueType = boolean | number | string;

export default class VariableDTO {
    _key!: string;
    access_level!: string;
    description!: string;
    name!: string;
    theme!: Array<string>;
    timeseries!: boolean;
    type!: string;
    values!: Array<{ timestamp: string; value: VariableValueType }>;

    constructor(jsonObj?: VariableDTO) {
        if (jsonObj) {
            this._key = jsonObj._key;
            this.access_level = jsonObj.access_level;
            this.description = jsonObj.description;
            this.name = jsonObj.name;
            this.theme = jsonObj.theme;
            this.type = jsonObj.type;
            this.values = jsonObj.values;
        }
    }
}
