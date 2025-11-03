package com.eventflow.eventservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.eventflow.eventservice.model.Evento;
// Repositorio JPA para la entidad Evento
public interface EventoRepository extends JpaRepository<Evento, Long> {
    // Spring Data JPA proporciona métodos automáticamente:
    // - save(S entity)
    // - findById(ID id)
    // - findAll()
    // - deleteById(ID id)
    // - count()
}
