package io.github.j_yuhanwang.food_ordering_app.auth_users.repository;

import io.github.j_yuhanwang.food_ordering_app.auth_users.entity.User;
import io.github.j_yuhanwang.food_ordering_app.enums.RoleType;
import io.github.j_yuhanwang.food_ordering_app.enums.UserStatus;
import io.github.j_yuhanwang.food_ordering_app.support.ContainerConfig;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(
        replace = AutoConfigureTestDatabase.Replace.NONE
)
@ActiveProfiles("test")
@Import(ContainerConfig.class)
class UserRepositoryTest {

    @Autowired
    UserRepository userRepository;

    @Autowired
    TestEntityManager entityManager;

    @Test
    void shouldFindPersistedUserByEmail() {
        // Arrange: prepare a user without related orders or payments
        User user = User.builder()
                .name("Test Student")
                .email("student@example.com")
                .password("test-password-placeholder")
                .build();

        user.getRoles().add(RoleType.ROLE_STUDENT);

        // Act: write to MySQL, then clear the persistence context
        User saved = userRepository.save(user);
        entityManager.flush();

        Long savedId = saved.getId();
        entityManager.clear();

        User found = userRepository.findByEmail("student@example.com")
                .orElseThrow(() ->
                        new AssertionError("Saved user was not found"));

        // Assert: verify persisted fields, role mapping and audit timestamps
        assertNotNull(savedId);
        assertEquals(savedId, found.getId());
        assertEquals("Test Student", found.getName());
        assertEquals("student@example.com", found.getEmail());
        assertEquals(UserStatus.ACTIVE, found.getUserStatus());
        assertFalse(found.isEmailVerified());

        assertEquals(1, found.getRoles().size());
        assertTrue(found.getRoles().contains(RoleType.ROLE_STUDENT));

        assertNotNull(found.getCreatedAt());
        assertNotNull(found.getUpdateAt());
    }
}