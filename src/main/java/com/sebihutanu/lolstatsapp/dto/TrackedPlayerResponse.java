package com.sebihutanu.lolstatsapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@Builder
public class TrackedPlayerResponse {
    private UUID id;
    private String riotPuuid;
    private String gameName;
    private String tagLine;
    private String region;
    private Integer summonerLevel;
    private Integer profileIconId;
    private String rankedTier;
    private String rankedRank;
    private Integer rankedLp;
    private LocalDateTime lastSyncedAt;
    private LocalDateTime createdAt;
}

