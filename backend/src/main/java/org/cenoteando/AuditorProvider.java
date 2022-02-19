package org.cenoteando;

import org.cenoteando.models.User;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

public class AuditorProvider implements AuditorAware<User> {
    @Override
    public Optional<User> getCurrentAuditor() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth instanceof AnonymousAuthenticationToken)
            return null;
        User user = (User) auth.getPrincipal();
        return Optional.of(user);
    }
}