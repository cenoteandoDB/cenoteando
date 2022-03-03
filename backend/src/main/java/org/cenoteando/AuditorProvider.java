package org.cenoteando;

import java.util.Optional;
import org.cenoteando.models.User;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class AuditorProvider implements AuditorAware<User> {

    @Override
    public Optional<User> getCurrentAuditor() {
        Authentication auth = SecurityContextHolder
            .getContext()
            .getAuthentication();
        if (
            auth instanceof AnonymousAuthenticationToken
        ) return Optional.empty();
        User user = (User) auth.getPrincipal();
        return Optional.of(user);
    }
}
