package com.sebihutanu.lolstatsapp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "tracked_players")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrackedPlayer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "riot_puuid", unique = true)
    private String riotPuuid;

    @Column(name = "game_name", nullable = false)
    private String gameName;

    @Column(name = "tag_line", nullable = false)
    private String tagLine;

    @Column(nullable = false)
    private String region;

    @Column(name = "summoner_level")
    private Integer summonerLevel;

    @Column(name = "profile_icon_id")
    private Integer profileIconId;

    @Column(name = "ranked_tier")
    private String rankedTier;

    @Column(name = "ranked_rank")
    private String rankedRank;

    @Column(name = "ranked_lp")
    private Integer rankedLp;

    @Column(name = "last_synced_at")
    private LocalDateTime lastSyncedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "trackedPlayer", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<WatchlistEntry> watchlistEntries = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
