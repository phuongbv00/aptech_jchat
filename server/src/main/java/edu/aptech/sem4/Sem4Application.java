package edu.aptech.sem4;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import javax.annotation.PostConstruct;
import java.util.TimeZone;

@SpringBootApplication
public class Sem4Application {

	public static void main(String[] args) {
		SpringApplication.run(Sem4Application.class, args);
	}

	@PostConstruct
	void post() {
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
	}
}
