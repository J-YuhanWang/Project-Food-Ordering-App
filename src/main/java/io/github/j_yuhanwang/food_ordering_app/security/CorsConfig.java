package io.github.j_yuhanwang.food_ordering_app.security;/*
 * @author BlairWang
 * @Date 28/12/2025 4:59 pm
 * @Version 1.0
 */

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer webMvcConfigurer(){
        return new WebMvcConfigurer(){
            @Override
            public void addCorsMappings(CorsRegistry registry){
                registry.addMapping("/**")
                        .allowedOrigins(
                                "http://localhost:3000", //customer-app frontend
                                "http://localhost:3001", //console-app frontend
                                "https://campuseats.yuhanwang.dev",       // customer-app 生产环境
                                "https://campuseats-admin.yuhanwang.dev"  // console-app 生产环境

                        )
                        .allowedMethods("GET","POST","PUT","DELETE","PATCH","OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(false);

            }
        };
    }
}
