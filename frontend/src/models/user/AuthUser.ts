export default class AuthUser {
    uid: string | null = null;
    name!: string;
    email!: string;
    role!: string;
    admin!: boolean;

    constructor(jsonObj?: AuthUser) {
        if (jsonObj) {
            this.uid = jsonObj.uid;
            this.name = jsonObj.name;
            this.email = jsonObj.email;
            this.role = jsonObj.role;
            this.admin = jsonObj.role == 'ADMIN';
        }
    }
}
