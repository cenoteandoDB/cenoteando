export default class SpeciesDTO {
    _key!: string;
    iNaturalistId!: string;
    aphiaId!: string;

    constructor(jsonObj?: SpeciesDTO) {
        if (jsonObj) {
            this._key = jsonObj._key;
            this.iNaturalistId = jsonObj.iNaturalistId;
            this.aphiaId = jsonObj.aphiaId;
        }
    }
}
