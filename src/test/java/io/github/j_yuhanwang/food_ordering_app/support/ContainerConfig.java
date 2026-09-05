package io.github.j_yuhanwang.food_ordering_app.support;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.containers.MySQLContainer;

@TestConfiguration(proxyBeanMethods = false)
public class ContainerConfig{

    @Bean
    @ServiceConnection
    MySQLContainer<?> mysql(){
        return new MySQLContainer<>("mysql:8.0.36")
                .withDatabaseName("campuseats_test")
                .withUsername("test")
                .withPassword("test");

    }

}