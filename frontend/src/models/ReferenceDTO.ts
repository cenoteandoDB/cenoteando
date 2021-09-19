export default class ReferenceDTO {
    _key!: string;
    authors!: string;
    fileName!: string;
    reference!: string;
    shortName!: string;
    type!: string;
    year!: string;

    constructor(jsonObj?: ReferenceDTO) {
        if (jsonObj) {
            this._key = jsonObj._key;
            this.authors = jsonObj.authors;
            this.fileName = jsonObj.fileName;
            this.reference = jsonObj.reference;
            this.shortName = jsonObj.shortName;
            this.type = jsonObj.type;
            this.year = jsonObj.year;
        }
    }
}
