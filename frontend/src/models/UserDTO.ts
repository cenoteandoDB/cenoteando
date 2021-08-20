export default class UserDTO {
    _key!: string;
    name!: string;
    email!: string;
    role!: string;

    constructor(jsonObj?: UserDTO) {
        if (jsonObj) {
            this._key = jsonObj._key;
            this.name = jsonObj.name;
            this.email = jsonObj.email;
            this.role = jsonObj.role;
        }
    }
}
