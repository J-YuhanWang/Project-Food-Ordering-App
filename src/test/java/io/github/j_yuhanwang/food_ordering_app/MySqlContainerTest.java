package io.github.j_yuhanwang.food_ordering_app;

import org.junit.jupiter.api.Test;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Testcontainers
class MySqlContainerTest {

    @Container
    static MySQLContainer<?> mysql =
            new MySQLContainer<>("mysql:8.0.36")
                    .withDatabaseName("campuseats_test")
                    .withUsername("test")
                    .withPassword("test");

    @Test
    void shouldConnectToTemporaryMySql() throws Exception {
        try (
                Connection connection = DriverManager.getConnection(
                        mysql.getJdbcUrl(),
                        mysql.getUsername(),
                        mysql.getPassword()
                );
                Statement statement = connection.createStatement();
                ResultSet result =
                        statement.executeQuery("SELECT DATABASE(), 1")
        ) {
            assertTrue(result.next());
            assertEquals("campuseats_test", result.getString(1));
            assertEquals(1, result.getInt(2));
        }
    }
}