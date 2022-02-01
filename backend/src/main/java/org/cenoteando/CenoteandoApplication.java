package org.cenoteando;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.PropertySource;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@PropertySource({ "classpath:application.properties" })
@SpringBootApplication
public class CenoteandoApplication {

	public static void main(String[] args) {
		SpringApplication.run(CenoteandoApplication.class, args);
	}

	@Bean
	public BCryptPasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder(10);
	}

}
