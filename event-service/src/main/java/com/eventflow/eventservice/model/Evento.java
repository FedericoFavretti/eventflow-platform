package com.eventflow.eventservice.model;

import jakarta.persistence.*;

// Entidad JPA que representa un evento
@Entity
@Table(name = "eventos") // Mapea la clase a la tabla "eventos" en la base de datos
public class Evento {
    
    // Atributos de la entidad Evento
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Generacion automatica del ID autoincremental
    private Long id;

    private String nombre;
    private String descripcion;
    private int aforoTotal;
    private int aforoDisponible;

    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public int getAforoTotal() { return aforoTotal; }
    public void setAforoTotal(int aforoTotal) { this.aforoTotal = aforoTotal; }

    public int getAforoDisponible() { return aforoDisponible; }
    public void setAforoDisponible(int aforoDisponible) { this.aforoDisponible = aforoDisponible; }
}
