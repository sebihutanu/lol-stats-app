package com.sebihutanu.lolstatsapp.repository;

import com.sebihutanu.lolstatsapp.entity.TrackedPlayer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TrackedPlayerRepository extends JpaRepository<TrackedPlayer, UUID> {
    Optional<TrackedPlayer> findByRiotPuuid(String riotPuuid);
    Optional<TrackedPlayer> findByGameNameAndTagLineAndRegion(String gameName, String tagLine, String region);

    @Query("SELECT p FROM TrackedPlayer p WHERE LOWER(p.gameName) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<TrackedPlayer> searchByGameName(@Param("search") String search, Pageable pageable);
}