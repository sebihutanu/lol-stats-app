package com.sebihutanu.lolstatsapp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "match_snapshots", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"tracked_player_id", "riot_match_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tracked_player_id", nullable = false)
    private TrackedPlayer trackedPlayer;

    @Column(name = "riot_match_id")
    private String riotMatchId;

    @Column(name = "champion_name", nullable = false)
    private String championName;

    @Column(nullable = false)
    private Integer kills;

    @Column(nullable = false)
    private Integer deaths;

    @Column(nullable = false)
    private Integer assists;

    @Column(nullable = false)
    private Boolean win;

    @Column(name = "queue_type")
    private String queueType;

    @Column(name = "played_at")
    private LocalDateTime playedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

