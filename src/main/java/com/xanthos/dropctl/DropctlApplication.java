package com.xanthos.dropctl;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class DropctlApplication {

    public static void main(String[] args) {
        SpringApplication.run(DropctlApplication.class, args);
    }

}
