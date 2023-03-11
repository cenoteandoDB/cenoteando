package org.cenoteando.auth.jwt;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.cenoteando.exceptions.CenoteandoException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

import static org.cenoteando.exceptions.ErrorMessage.EXPIRED_TOKEN;
import static org.cenoteando.exceptions.ErrorMessage.UNEXPECTED_ERROR;

@Component
public class JwtProvider {

    @Value("${jwt.secret}")
    private String SECRET_KEY;

    @Value("${jwt.ttl}")
    private long ttl;

    public long getTtl(){
        return ttl;
    }

    /**
     * Generates a JWT for a specific user
     * Expiration time is set to 1h
     * Secret_key is a random key to fortify the signature
     * @param username the username of the user requesting the jwt
     * @return a string representing the JWT
     */
    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + ttl * 1000))
                .signWith(SignatureAlgorithm.HS512, SECRET_KEY)
                .compact();
    }

    /**
     * Parses a JWT and retrieves the username stored in it.
     * In case of token being expired a proper error message is thrown,
     * otherwise a generic error fail is sent
     * @param token the jwt to be parsed
     * @return the username hashed in the token
     */
    public String parseToken(String token) {
        try {
            return Jwts.parser().setSigningKey(SECRET_KEY).parseClaimsJws(token).getBody().getSubject();
        } catch (ExpiredJwtException e) {
            throw new CenoteandoException(EXPIRED_TOKEN);
        } catch (JwtException | IllegalArgumentException e) {
            throw new CenoteandoException(UNEXPECTED_ERROR);
        }
    }

}
