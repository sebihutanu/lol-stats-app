package com.sebihutanu.lolstatsapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@Builder
public class WatchlistEntryResponse {
    private UUID id;
    private String customNote;
    private LocalDateTime createdAt;
    private TrackedPlayerResponse trackedPlayer;
}

