package io.github.j_yuhanwang.food_ordering_app.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * @author YuhanWang
 * @Date 07/06/2026 4:30 pm
 */
@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI ucdCanteenOpenAPI(){
        return new OpenAPI()
                .info(new Info()
                        .title("UCD Canteen Hub API")
                        .description("Backend APIs for UCD Campus Food Ordering System")
                                .version("v1.0")
                                .contact(new Contact()
                                        .name("Yuhan Wang")
                                        .email("wangyuhan6459@gmail.com"))
                        );
    }
}
