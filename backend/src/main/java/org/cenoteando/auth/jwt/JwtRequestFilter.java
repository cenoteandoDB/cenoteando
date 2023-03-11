package org.cenoteando.auth.jwt;

import java.io.IOException;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.constraints.NotNull;

import org.cenoteando.auth.AuthDetails;
import org.cenoteando.services.UsersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private UsersService usersService;

    @Autowired
    private JwtProvider jwtProvider;

    @Override
    protected void doFilterInternal(
        @NotNull HttpServletRequest request,
        @NotNull HttpServletResponse response,
        @NotNull FilterChain chain
    ) throws ServletException, IOException {
        final String authorizationHeader = request.getHeader("Authorization");

        String jwt;
        String username;

        if(isValidHeader(authorizationHeader)){
            jwt = authorizationHeader.substring(7);
            username = jwtProvider.parseToken(jwt);

            AuthDetails auth = this.usersService.loadUserByUsername(username);

            //Authentication user and it's authorities
            UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
                    auth.getUser(),
                    null,
                    auth.getAuthorities()
            );

            //store request data inside Authentication
            usernamePasswordAuthenticationToken.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request)
            );

            //set Authentication on SecurityContextHolder from Spring Security
            // so that it can then check roles in requests
            SecurityContextHolder
                    .getContext()
                    .setAuthentication(usernamePasswordAuthenticationToken);
        }

        chain.doFilter(request, response);
    }

    public boolean isValidHeader(String header){
        return header != null && header.startsWith("Bearer ");
    }
}
