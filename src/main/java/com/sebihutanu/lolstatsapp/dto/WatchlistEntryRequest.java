package com.sebihutanu.lolstatsapp.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class WatchlistEntryRequest {

    @NotNull(message = "Tracked player ID is required")
    private UUID trackedPlayerId;

    private String customNote;
}

