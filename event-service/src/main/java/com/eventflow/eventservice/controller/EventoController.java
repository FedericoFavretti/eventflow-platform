package com.eventflow.eventservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.eventflow.eventservice.model.Evento;
import com.eventflow.eventservice.repository.EventoRepository;
import java.util.List;

import java.util.Optional;

@RestController
@RequestMapping("/api/eventos")
public class EventoController {

    private final EventoRepository eventoRepository;

    // Constructor - inyección de dependencia
    public EventoController(EventoRepository eventoRepository) {
        this.eventoRepository = eventoRepository;
    }

    // POST /api/eventos - Crea un nuevo evento
    @PostMapping
    public ResponseEntity<Evento> crearEvento(@RequestBody Evento evento) {
        evento.setAforoDisponible(evento.getAforoTotal()); // Inicializa el aforo disponible
        Evento nuevo = eventoRepository.save(evento); // Guarda el evento en la base de datos
        return ResponseEntity.ok(nuevo); // Devuelve el evento creado
    }

    // GET /api/eventos/{evento_id} - Recupera un evento y su aforo disponible
    @GetMapping("/{id}")
    public ResponseEntity<Evento> obtenerEvento(@PathVariable("id") Long id) {
        Optional<Evento> evento = eventoRepository.findById(id);
        return evento.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }

    // 🆕 GET /api/eventos - Devuelve todos los eventos
    @GetMapping
    public ResponseEntity<List<Evento>> obtenerTodosLosEventos() {
        List<Evento> eventos = eventoRepository.findAll();
        return ResponseEntity.ok(eventos);
    }
}
