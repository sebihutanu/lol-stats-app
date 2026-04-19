package com.sebihutanu.lolstatsapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class LolStatsAppApplication {

    public static void main(String[] args) {
        SpringApplication.run(LolStatsAppApplication.class, args);
    }

}
