package io.github.j_yuhanwang.food_ordering_app.security;/*
 * @author BlairWang
 * @Date 24/12/2025 8:02 pm
 * @Version 1.0
 */


import io.github.j_yuhanwang.food_ordering_app.enums.RoleType;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.function.Function;

@Service
@Slf4j
public class JwtUtils {
    //expiration time for 30 days
    private static final long ACCESS_EXPIRATION = 15 * 60 *1000; // 15 mins to milliseconds
    private static final long REFRESH_EXPIRATION = 7L * 24 * 60 * 60 *1000; // 7 days refresh expiration to milliseconds
    // A variable of type SecretKey has been declared,
    // which is currently empty and will have a value after init() is executed.
    // This key is the key object used later for signing and verification.
    private SecretKey key;

    // Find the configuration variable named secretJwtString inside the application.properties
    // inject secretJwtString's value into this class variable secretJwtString.
    @Value("${secretJwtString}")
    private String secretJwtString;

    /**
     * application.yml
     *         ↓ @Value injection
     * secretJwtString (string)
     *         ↓ getBytes()
     * keyByte (the array of bytes)
     *         ↓ new SecretKeySpec()
     * key (SecretKey object,used for signing and verifying)
     */
    @PostConstruct
    private void init(){
        byte[] keyByte = secretJwtString.getBytes(StandardCharsets.UTF_8);
        this.key = new SecretKeySpec(keyByte,"HmacSHA256");
    }

    /**
     * Generates a short-lived Access Token for authenticating API requests.
     *
     * <p>Access Token expires in 15 minutes. Roles are embedded in the payload
     * so that {@link io.github.j_yuhanwang.food_ordering_app.security.AuthFilter}
     * can perform role-based authorization without querying the database on every request,
     * reducing database load under high-concurrency scenarios (e.g. menu browsing).</p>
     *
     * <p>Roles are refreshed on each token renewal cycle via the Refresh Token,
     * ensuring role changes take effect within 15 minutes.</p>
     *
     * @param email the user's email address, used as the JWT subject
     * @param roles the user's current roles, embedded in the payload as a claim
     * @return a signed Access Token string
     */
    public String generateAccessToken(String email, List<RoleType> roles){
        return Jwts.builder()
                .subject(email)
                .claim("roles",roles)
                .claim("type","access")
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis()+ACCESS_EXPIRATION))
                .signWith(key)
                .compact();
    }

    /**
     * Generates a long-lived Refresh Token used to renew expired Access Tokens.
     *
     * <p>Refresh Token expires in 7 days and is stored in Redis upon login.
     * It does not carry roles, as its sole purpose is to verify that the user's
     * session is still valid. Fresh roles are fetched from the database at the
     * point of token renewal and embedded into the newly issued Access Token.</p>
     *
     * @param email the user's email address, used as the JWT subject
     * @return a signed Refresh Token string
     */
    public String generateRefreshToken(String email){
        return Jwts.builder()
                .subject(email)
                .claim("type","refresh")
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis()+REFRESH_EXPIRATION))
                .signWith(key)
                .compact();
    }

    public <T> T extractClaims(String token, Function<Claims,T> claimsTFunction){
        return claimsTFunction.apply(
                Jwts.parser()
                        .verifyWith(key)
                        .build()
                        .parseSignedClaims(token)
                        .getPayload());

    }

    public String getUsernameFromToken(String token){
        return extractClaims(token,Claims::getSubject);
    }

    public String extractTokenType(String token){
        return extractClaims(token,claims -> claims.get("type", String.class));
    }

    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token){
        return extractClaims(token,claims->claims.get("roles",List.class));
    }

    //Utilised the AuthFilter to check the type of token, not at JwtUtils
    private boolean isTokenExpired(String token) {
        return extractClaims(token,Claims::getExpiration).before(new Date());
    }
}
