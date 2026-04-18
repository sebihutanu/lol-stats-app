package com.sebihutanu.lolstatsapp.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TrackedPlayerRequest {

    @NotBlank(message = "Game name is required")
    private String gameName;

    @NotBlank(message = "Tag line is required")
    private String tagLine;

    @NotBlank(message = "Region is required")
    private String region;
}

