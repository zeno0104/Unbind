package com.example.unbind;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class UnbindApplication {

	public static void main(String[] args) {
		SpringApplication.run(UnbindApplication.class, args);
	}

}
