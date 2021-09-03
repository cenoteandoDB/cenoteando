export default class SpecieDTO {
    _key!: string;
    i_naturalist_id!: string;
    aphia_id!: string;
    name!: string;
    gbif_id!: string;

    constructor(jsonObj?: SpecieDTO) {
        if (jsonObj) {
            this._key = jsonObj._key;
            this.i_naturalist_id = jsonObj.i_naturalist_id;
            this.aphia_id = jsonObj.aphia_id;
            this.name = jsonObj.name;
            this.gbif_id = jsonObj.gbif_id;
        }
    }
}
