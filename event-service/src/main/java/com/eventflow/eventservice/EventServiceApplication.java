package com.eventflow.eventservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication // Anotacion que indica que esta es la clase principal de una aplicacion Spring Boot
public class EventServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(EventServiceApplication.class, args); // Esta linea inicia la aplicacion Spring Boot
	}

}
