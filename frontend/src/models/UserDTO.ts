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
    themesWhiteList!: Array<string>;
    themesBlackList!: Array<string>;
    cenoteWhiteList!: Array<string>;
    cenoteBlackList!: Array<string>;

    constructor(jsonObj?: UserDTO) {
        if (jsonObj) {
            this.id = jsonObj.id;
            this.name = jsonObj.name;
            this.email = jsonObj.email;
            this.role = jsonObj.role;
            this.themesWhiteList = jsonObj.themesWhiteList;
            this.themesBlackList = jsonObj.themesBlackList;
            this.cenoteWhiteList = jsonObj.cenoteWhiteList;
            this.cenoteBlackList = jsonObj.cenoteBlackList;
        }
    }
}
