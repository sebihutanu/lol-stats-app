package com.sebihutanu.lolstatsapp.repository;

import com.sebihutanu.lolstatsapp.entity.MatchSnapshot;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MatchSnapshotRepository extends JpaRepository<MatchSnapshot, UUID> {

    // No filters
    Page<MatchSnapshot> findByTrackedPlayerIdOrderByPlayedAtDesc(UUID trackedPlayerId, Pageable pageable);

    // Win/Loss filter only
    Page<MatchSnapshot> findByTrackedPlayerIdAndWinOrderByPlayedAtDesc(UUID trackedPlayerId, boolean win, Pageable pageable);

    // Champion search only
    @Query("SELECT m FROM MatchSnapshot m WHERE m.trackedPlayer.id = :playerId AND LOWER(m.championName) LIKE LOWER(CONCAT('%', :search, '%')) ORDER BY m.playedAt DESC")
    Page<MatchSnapshot> searchByChampion(@Param("playerId") UUID playerId, @Param("search") String search, Pageable pageable);

    // Champion search + win/loss filter
    @Query("SELECT m FROM MatchSnapshot m WHERE m.trackedPlayer.id = :playerId " +
            "AND LOWER(m.championName) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "AND m.win = :win " +
            "ORDER BY m.playedAt DESC")
    Page<MatchSnapshot> searchByChampionAndWin(@Param("playerId") UUID playerId,
                                               @Param("search") String search,
                                               @Param("win") boolean win,
                                               Pageable pageable);

    boolean existsByTrackedPlayerIdAndRiotMatchId(UUID trackedPlayerId, String riotMatchId);
}
