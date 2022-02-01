export default class SpeciesDTO {
    id!: string;
    iNaturalistId!: string;
    aphiaId!: string;

    constructor(jsonObj?: SpeciesDTO) {
        if (jsonObj) {
            this.id = jsonObj.id;
            this.iNaturalistId = jsonObj.iNaturalistId;
            this.aphiaId = jsonObj.aphiaId;
        }
    }
}
