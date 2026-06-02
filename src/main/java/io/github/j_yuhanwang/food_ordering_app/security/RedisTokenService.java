package io.github.j_yuhanwang.food_ordering_app.security;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

/**
 * @author YuhanWang
 * @Date 02/06/2026 5:08 pm
 */
@Service
@RequiredArgsConstructor
public class RedisTokenService {

    private final StringRedisTemplate stringRedisTemplate;
    private static final String REFRESH_PREFIX="auth:refresh:";

    /**
     * Saves the Refresh Token to Redis upon successful login.
     * JwtUtils.REFRESH_EXPIRATION_DAYS matches the token's own expiration to ensure automatic cleanup.
     *
     * @param userId       the user's database ID, used as part of the Redis key
     * @param refreshToken the signed Refresh Token string to store
     */
    public void saveRefreshToken(Long userId, String refreshToken){
        stringRedisTemplate.opsForValue().set(
                REFRESH_PREFIX+userId,
                refreshToken,
                JwtUtils.REFRESH_EXPIRATION_DAYS,
                TimeUnit.DAYS
                );
    }

    /**
     * Validates whether the given Refresh Token matches the one stored in Redis.
     * Returns false if the key does not exist (expired or logged out).
     *
     * @param userId       the user's database ID
     * @param refreshToken the Refresh Token string presented by the client
     * @return true if the token exists in Redis and matches exactly
     */
    public boolean isRefreshTokenValid(Long userId, String refreshToken){
        if(refreshToken==null || refreshToken.isBlank()){
            return false;
        }

        // Get the token stored in the redis by prefix + userid
        String stored = stringRedisTemplate.opsForValue().get(REFRESH_PREFIX + userId);
        return stored != null && stored.equals(refreshToken);
    }

    /**
     * Removes the Refresh Token from Redis on logout.
     * After deletion, any subsequent token refresh attempts will be rejected.
     *
     * @param userId the user's database ID
     */
    public void deleteRefreshToken(Long userId){
        stringRedisTemplate.delete(REFRESH_PREFIX+userId);
    }

    /**
     * Checks whether an active session exists for the given user.
     * Used by sensitive endpoints (e.g. payment) to confirm the session
     * has not been revoked since the Access Token was issued.
     *
     * @param userId the userId
     * @return true if a Refresh Token entry exists in Redis
     */
    public boolean isSessionValid(Long userId){
        return Boolean.TRUE.equals(
                stringRedisTemplate.hasKey(REFRESH_PREFIX+userId)
        );
    }

}
