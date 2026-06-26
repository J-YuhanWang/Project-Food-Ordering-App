package io.github.j_yuhanwang.food_ordering_app.config;

import io.github.j_yuhanwang.food_ordering_app.auth_users.entity.User;
import io.github.j_yuhanwang.food_ordering_app.auth_users.repository.UserRepository;
import io.github.j_yuhanwang.food_ordering_app.enums.RoleType;
import io.github.j_yuhanwang.food_ordering_app.enums.UserStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Seeds essential system accounts on first startup.
 * Skips creation if the account already exists — safe to run repeatedly.
 */
@Component
@Profile("!test")
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    @Value("${app.init.admin-password}")
    private String adminPassword;

    @Value("${app.init.manager-password}")
    private String managerPassword;

    @Value("${app.init.student-password}")
    private String studentPassword;

    @Override
    public void run(String... args) {
        createIfAbsent("System Admin", "admin@campuseats.ie",
                adminPassword, RoleType.ROLE_ADMIN);
        createIfAbsent("Demo Manager", "manager@campuseats.ie",
                managerPassword, RoleType.ROLE_MANAGER);
        createIfAbsent("Demo Student", "student@campuseats.ie",
                studentPassword, RoleType.ROLE_STUDENT);
    }

    private void createIfAbsent(String name, String email,
                                String rawPassword, RoleType role) {
        if (userRepository.existsByEmail(email)) {
            log.info("[DataInitializer] Account already exists, skipping: {}", email);
            return;
        }
        User user = User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .roles(List.of(role))
                .userStatus(UserStatus.ACTIVE)
                .emailVerified(true)
                .build();
        userRepository.save(user);
        log.info("[DataInitializer] Created {} account: {}", role, email);
    }
}