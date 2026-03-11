package com.y4vra.irboardbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.y4vra.irboardbackend")
public class IrBoardBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(IrBoardBackendApplication.class, args);
    }

}
