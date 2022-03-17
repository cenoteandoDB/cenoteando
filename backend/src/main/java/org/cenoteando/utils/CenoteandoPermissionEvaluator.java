package org.cenoteando.utils;

import static org.cenoteando.models.User.Role.CENOTERO_ADVANCED;
import static org.cenoteando.models.User.Role.RESEARCHER;
import static org.cenoteando.models.Variable.AccessLevel.SENSITIVE;

import java.io.Serializable;
import org.cenoteando.models.Cenote;
import org.cenoteando.models.User;
import org.cenoteando.models.Variable;
import org.cenoteando.repository.CenotesRepository;
import org.cenoteando.services.VariableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
public class CenoteandoPermissionEvaluator implements PermissionEvaluator {

    @Autowired
    private CenotesRepository cenotesRepository;

    @Autowired
    private VariableService variableService;

    @Override
    public boolean hasPermission(
        Authentication authentication,
        Object targetDomainObject,
        Object permissionEval
    ) {
        if (authentication == null) {
            return false;
        }

        User user = ((User) authentication.getPrincipal());
        String permission = (String) permissionEval;

        if (targetDomainObject instanceof String) {
            String id = (String) targetDomainObject;
            Variable variable;
            Cenote cenote;

            switch (permission) {
                case "CENOTE.UPDATE":
                    if (user.getRole() == CENOTERO_ADVANCED) return user
                        .getCenoteWhiteList()
                        .contains(id);
                    return false;
                case "CENOTE.DELETE":
                    cenote = cenotesRepository.findByKey(id);
                    if (
                        user.getRole() == RESEARCHER ||
                        user.getRole() == CENOTERO_ADVANCED
                    ) {
                        return cenote.isCreator(user);
                    }
                    return false;
                case "VARIABLE.CREATE":
                    variable = variableService.getVariable(id);
                    if (user.getRole() == CENOTERO_ADVANCED) return user
                        .getThemesWhiteList()
                        .contains(variable.getTheme().toString());
                    return false;
                case "VARIABLE.UPDATE":
                    variable = variableService.getVariable(id);
                    switch (user.getRole()) {
                        case ADMIN:
                        case RESEARCHER:
                            return (
                                variable.getAccessLevel() != SENSITIVE ||
                                variable.isCreator(user)
                            );
                        case CENOTERO_ADVANCED:
                            return user
                                .getThemesWhiteList()
                                .contains(variable.getTheme().name());
                        default:
                            return false;
                    }
                case "VARIABLE.DELETE":
                    variable = variableService.getVariable(id);
                    return variable.isCreator(user);
            }
        }

        if (targetDomainObject instanceof Variable variable) {
            if ("VARIABLE.CREATE".equals(permission)) {
                return user
                    .getThemesWhiteList()
                    .contains(variable.getTheme().name());
            }
            return false;
        }

        return false;
    }

    @Override
    public boolean hasPermission(
        Authentication authentication,
        Serializable targetId,
        String targetType,
        Object permission
    ) {
        return false;
    }
}
