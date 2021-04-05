import typeArango, { LogLevel, config } from 'type-arango';

const complete = typeArango({
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
  getAuthorizedRoles(userRoles: string[], accessRoles: string[]): string[] {
    return userRoles.filter((role: string) => accessRoles.includes(role));
  },
});

export * from './documents/Cenote';
export * from './documents/GADM';

export * from './collections/Cenotes';

complete();
