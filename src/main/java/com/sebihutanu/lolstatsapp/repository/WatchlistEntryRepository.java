package com.sebihutanu.lolstatsapp.repository;

import com.sebihutanu.lolstatsapp.entity.WatchlistEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WatchlistEntryRepository extends JpaRepository<WatchlistEntry, UUID> {
    Page<WatchlistEntry> findByUserId(UUID userId, Pageable pageable);

    @Query("SELECT w FROM WatchlistEntry w WHERE w.user.id = :userId AND LOWER(w.trackedPlayer.gameName) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<WatchlistEntry> searchByPlayerName(@Param("userId") UUID userId, @Param("search") String search, Pageable pageable);

    Optional<WatchlistEntry> findByUserIdAndTrackedPlayerId(UUID userId, UUID trackedPlayerId);
    boolean existsByUserIdAndTrackedPlayerId(UUID userId, UUID trackedPlayerId);
}

