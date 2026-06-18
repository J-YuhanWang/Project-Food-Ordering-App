package io.github.j_yuhanwang.food_ordering_app.auth_users.services;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

/**
 * Manages short-lived email verification codes stored in Redis.
 *
 * <p>Each code is keyed by the user's email address and expires automatically
 * after {@value TTL_MINUTES} minutes, eliminating the need for manual cleanup.
 *
 * <p>This service is used exclusively during the registration flow:
 * the code must be verified before the User entity is persisted.
 *
 * @author YuhanWang
 * @since 03/06/2026
 */

@Service
@RequiredArgsConstructor
public class VerificationCodeService {

    private final StringRedisTemplate redisTemplate;

    //1. Send verification code before register
    /** Redis key prefix. Full key format: {@code verify:{email}} */
    private static final String KEY_PREFIX="verify:";
    private static final Long TTL_MINUTES=5L;

    /**
     * Redis key for rate limiting. Key format: {@code rate:send-code:{email}}
     */
    private static final String RATE_LIMIT_PREFIX="rate:send-code:";
    private static final Long RATE_LIMIT_TTL_SECONDS=60L;

    /**
     * Stores a verification code for the given email.
     * Any previously stored code for this email is overwritten.
     *
     * @param email the recipient's email address (used as part of the Redis key)
     * @param code  the 6-digit verification code to store
     */
    public void saveCode(String email,String code){
        redisTemplate.opsForValue()
                .set(KEY_PREFIX+email,code,TTL_MINUTES, TimeUnit.MINUTES);
    }

    /**
     * Retrieves the stored verification code for the given email.
     *
     * @param email the email address to look up
     * @return the stored code, or {@code null} if it has expired or never existed
     */
    public String getCode(String email){
        return redisTemplate.opsForValue().get(KEY_PREFIX+email);
    }

    //2. Rate Limiting to prevent high frequency verification code request within 1 minute
    /**
     * Deletes the verification code for the given email.
     * Called immediately after successful verification to prevent reuse.
     *
     * @param email the email address whose code should be invalidated
     */
    public void deleteCode(String email){
        redisTemplate.delete(KEY_PREFIX+email);
    }

    /**
     * Returns true if this email has requested a code within the last minute.
     */
    public boolean isRateLimited(String email){
        return Boolean.TRUE.equals(
                redisTemplate.hasKey(RATE_LIMIT_PREFIX+email)
        );
    }

    /**
     * Marks this email as rate-limited for 60 seconds.
     * Called immediately after a code is successfully dispatched.
     */
    public void makeRateLimited(String email){
        redisTemplate.opsForValue().set(
                RATE_LIMIT_PREFIX+email, //key
                "1", //value - placeholder
                RATE_LIMIT_TTL_SECONDS, //timeout=60
                TimeUnit.SECONDS // time unit = seconds
        );
    }

    //key: "rate:send-code:blair@gmail.com"  value: "1"  TTL: 60s
    //key: "verify:blair@gmail.com"          value: "483921"  TTL: 300s
}
