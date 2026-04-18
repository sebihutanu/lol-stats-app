package com.sebihutanu.lolstatsapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MatchSnapshotRequest {

    private String riotMatchId;

    @NotBlank(message = "Champion name is required")
    private String championName;

    @NotNull(message = "Kills is required")
    private Integer kills;

    @NotNull(message = "Deaths is required")
    private Integer deaths;

    @NotNull(message = "Assists is required")
    private Integer assists;

    @NotNull(message = "Win is required")
    private Boolean win;

    private String queueType;

    private LocalDateTime playedAt;
}

