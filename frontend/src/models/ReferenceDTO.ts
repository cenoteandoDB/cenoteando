export default class ReferenceDTO {
    id!: string;
    authors!: string;
    hasFile!: boolean;
    reference!: string;
    shortName!: string;
    type!: string;
    year!: string;

    constructor(jsonObj?: ReferenceDTO) {
        if (jsonObj) {
            this.id = jsonObj.id;
            this.authors = jsonObj.authors;
            this.hasFile = jsonObj.hasFile;
            this.reference = jsonObj.reference;
            this.shortName = jsonObj.shortName;
            this.type = jsonObj.type;
            this.year = jsonObj.year;
        }
    }
}
