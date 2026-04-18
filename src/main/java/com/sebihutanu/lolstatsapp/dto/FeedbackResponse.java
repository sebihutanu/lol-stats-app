package com.sebihutanu.lolstatsapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@Builder
public class FeedbackResponse {
    private UUID id;
    private String category;
    private Integer rating;
    private Boolean allowContact;
    private String message;
    private String userName;
    private String userEmail;
    private LocalDateTime createdAt;
}

