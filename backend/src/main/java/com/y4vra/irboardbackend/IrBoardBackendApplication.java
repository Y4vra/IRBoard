package com.y4vra.irboardbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.y4vra.irboardbackend")
@EntityScan(basePackages = "com.y4vra.irboardbackend.infrastructure.persistence.entity")
@EnableJpaRepositories(basePackages = "com.y4vra.irboardbackend.infrastructure.persistence.jpa")
public class IrBoardBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(IrBoardBackendApplication.class, args);
    }

}
