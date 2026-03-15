package com.y4vra.irboardbackend;

import com.y4vra.irboardbackend.infrastructure.configuration.HeaderAuthenticationFilter;
import com.y4vra.irboardbackend.infrastructure.configuration.SecurityConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;

@SpringBootApplication(scanBasePackages = "com.y4vra.irboardbackend")
@Import({SecurityConfig.class, HeaderAuthenticationFilter.class})
public class IrBoardBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(IrBoardBackendApplication.class, args);
    }

}
