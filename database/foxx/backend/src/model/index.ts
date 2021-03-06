import typeArango, { config, LogLevel } from 'type-arango';

export const complete = typeArango({
    // verbose
    logLevel: LogLevel.Debug,

    // TODO: Setup roles
    // clients will always have these roles, no mather if they're authenticated (also see getUserRoles)
    providedRolesDefault: ['guest'],

    // when a route has no roles assigned, these roles will be required
    requiredRolesFallback: ['user'],

    // when a route has no writer roles assigned, these roles will be required
    requiredWriterRolesFallback: ['admin'],

    // extracts the users `roles` from req.session.data.roles (this is the default config value)
    getUserRoles(req: Foxx.Request): string[] {
        return (
            (req.session && req.session.data && req.session.data.roles) ||
            []
        ).concat(config.providedRolesDefault);
    },

    // returns the user access roles that can be applied to the current route (this is the default config value)
    getAuthorizedRoles(
        userRoles: Array<string>,
        accessRoles: Array<string>,
    ): string[] {
        return userRoles.filter((role: string) => accessRoles.includes(role));
    },
});

export * as _Documents from './documents';
export * as _Collections from './collections';
