export enum UserRole {
    ADMIN = 'ADMIN',
    RESEARCHER = 'RESEARCHER',
    CENOTERO_ADVANCED = 'CENOTERO_ADVANCED',
    CENOTERO_BASIC = 'CENOTERO_BASIC',
}

export default class UserDTO {
    id!: string;
    name!: string;
    email!: string;
    role!: UserRole;

    constructor(jsonObj?: UserDTO) {
        if (jsonObj) {
            this.id = jsonObj.id;
            this.name = jsonObj.name;
            this.email = jsonObj.email;
            this.role = jsonObj.role;
        }
    }
}
