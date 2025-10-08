package com.eventflow.eventservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.eventflow.eventservice.model.Evento;

public interface EventoRepository extends JpaRepository<Evento, Long> {
}
