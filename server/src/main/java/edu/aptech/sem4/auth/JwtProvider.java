package edu.aptech.sem4.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.aptech.sem4.models.User;
import io.jsonwebtoken.*;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.jboss.logging.Logger;
import org.springframework.stereotype.Component;

import java.util.Date;

@Data
@Slf4j
@Component
public class JwtProvider {
    private final String Uri = "/api/auth/**";
    private final String header = "Authorization";
    private final String prefix = "Bearer ";
    private final int expiration = 24*60*60*1000;
    private final String secret = "jalskdjlakjdlkajsdlkjsalkdjsalkdjlksajdlksajdlksajdlkjsalkdjaslkdjlksajdlksajdl";

    public String generateToken(User credentials) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);
        return Jwts.builder()
                .setSubject(credentials.getId().toString())
                .claim("credentials", credentials)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(SignatureAlgorithm.HS256, secret)
                .compact();
    }

    public User getCredentials(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(secret)
                .parseClaimsJws(token)
                .getBody();
        var credentials = new ObjectMapper().convertValue(claims.get("credentials"), User.class);
        return credentials;
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parser().setSigningKey(secret).parseClaimsJws(authToken);
            return true;
        } catch (MalformedJwtException ex) {
            log.error("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            log.error("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            log.error("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            log.error("JWT claims string is empty.");
        } catch (Exception ex) {
            log.error(ex.getMessage());
        }
        return false;
    }
}
