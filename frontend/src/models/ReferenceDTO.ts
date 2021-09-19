export default class ReferenceDTO {
    _key!: string;
    filename!: string;
    reference!: string;
    short_name!: string;
    type!: string;
    year!: string;

    constructor(jsonObj?: ReferenceDTO) {
        if (jsonObj) {
            this._key = jsonObj._key;
            this.filename = jsonObj.filename;
            this.reference = jsonObj.reference;
            this.short_name = jsonObj.short_name;
            this.type = jsonObj.type;
            this.year = jsonObj.year;
        }
    }
}
