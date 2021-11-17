export enum Origin {
    FIELD = 'FIELD',
    OFFICE = 'OFFICE',
}

export default class VariableDTO {
    _key!: string;
    accessLevel!: string;
    description!: string;
    multiple!: boolean;
    name!: string;
    origin!: string;
    theme!: string;
    timeseries!: boolean;
    type!: string;
    units: string | null = null;
    enumValues: Array<string> | null = null;
    methodology: string | null = null;

    constructor(jsonObj?: VariableDTO) {
        if (jsonObj) {
            this._key = jsonObj._key;
            this.accessLevel = jsonObj.accessLevel;
            this.description = jsonObj.description;
            this.multiple = jsonObj.multiple;
            this.name = jsonObj.name;
            this.origin = jsonObj.origin;
            this.theme = jsonObj.theme;
            this.timeseries = jsonObj.timeseries;
            this.type = jsonObj.type;
            if (jsonObj.units) {
                this.units = jsonObj.units;
            }
            if (jsonObj.enumValues) {
                this.enumValues = jsonObj.enumValues;
            }
            if (jsonObj.methodology) {
                this.methodology = jsonObj.methodology;
            }
        }
    }
}
