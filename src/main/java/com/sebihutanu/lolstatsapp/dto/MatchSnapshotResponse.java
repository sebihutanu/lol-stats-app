package com.sebihutanu.lolstatsapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@Builder
public class MatchSnapshotResponse {
    private UUID id;
    private String riotMatchId;
    private String championName;
    private Integer kills;
    private Integer deaths;
    private Integer assists;
    private Boolean win;
    private String queueType;
    private LocalDateTime playedAt;
    private LocalDateTime createdAt;
}

