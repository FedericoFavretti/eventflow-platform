package com.reservation.repository;

import com.reservation.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

//Esta clase da acceso a funciones nativas para SQL

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
}