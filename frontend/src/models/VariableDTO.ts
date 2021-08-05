export default class VariableDTO {
    _key!: string;
    access_level!: string;
    description!: string;
    name!: string;
    theme!: Array<string>;
    timeseries!: boolean;
    type!: string;

    constructor(jsonObj?: VariableDTO) {
        if (jsonObj) {
            this._key = jsonObj._key;
            this.access_level = jsonObj.access_level;
            this.description = jsonObj.description;
            this.name = jsonObj.name;
            this.theme = jsonObj.theme;
            this.timeseries = jsonObj.timeseries;
            this.type = jsonObj.type;
        }
    }
}
