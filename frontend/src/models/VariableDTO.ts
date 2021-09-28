export default class VariableDTO {
    _key!: string;
    accessLevel!: string;
    description!: string;
    name!: string;
    theme!: string;
    timeseries!: boolean;
    type!: string;

    constructor(jsonObj?: VariableDTO) {
        if (jsonObj) {
            this._key = jsonObj._key;
            this.accessLevel = jsonObj.accessLevel;
            this.description = jsonObj.description;
            this.name = jsonObj.name;
            this.theme = jsonObj.theme;
            this.timeseries = jsonObj.timeseries;
            this.type = jsonObj.type;
        }
    }
}
