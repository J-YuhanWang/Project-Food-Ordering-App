package io.github.j_yuhanwang.food_ordering_app;

import io.github.j_yuhanwang.food_ordering_app.support.ContainerConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import javax.sql.DataSource;
import java.sql.Connection;

import static org.junit.jupiter.api.Assertions.assertEquals;

@DataJpaTest
@AutoConfigureTestDatabase(
        replace = AutoConfigureTestDatabase.Replace.NONE
)
@ActiveProfiles("test")
@Import(ContainerConfig.class)
class DatabaseConnectionTest {


    @Autowired
    DataSource dataSource;

    @Autowired
    MySQLContainer<?> mysql;

    @Test
    void shouldConnectToContainerDatabase() throws Exception {
        try (Connection connection = dataSource.getConnection()) {
            assertEquals(
                    mysql.getJdbcUrl(),
                    connection.getMetaData().getURL()
            );

            assertEquals(
                    "campuseats_test",
                    connection.getCatalog()
            );
        }
    }
}