export enum UserRole {
    CENOTERO = 'CENOTERO',
    OWNER = 'OWNER',
    REGIONAL_MANAGER = 'REGIONAL_MANAGER',
    THEMATIC_MANAGER = 'THEMATIC_MANAGER',
    ADMIN = 'ADMIN',
}

export default class UserDTO {
    _key!: string;
    name!: string;
    email!: string;
    role!: UserRole;

    constructor(jsonObj?: UserDTO) {
        if (jsonObj) {
            this._key = jsonObj._key;
            this.name = jsonObj.name;
            this.email = jsonObj.email;
            this.role = jsonObj.role;
        }
    }
}
