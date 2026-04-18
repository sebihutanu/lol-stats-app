package com.sebihutanu.lolstatsapp.controller;

import com.sebihutanu.lolstatsapp.dto.FeedbackRequest;
import com.sebihutanu.lolstatsapp.dto.FeedbackResponse;
import com.sebihutanu.lolstatsapp.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping
    public ResponseEntity<FeedbackResponse> create(
            Authentication authentication,
            @Valid @RequestBody FeedbackRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        FeedbackResponse response = feedbackService.create(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/mine")
    public ResponseEntity<Page<FeedbackResponse>> getMyFeedback(
            Authentication authentication,
            Pageable pageable) {
        UUID userId = (UUID) authentication.getPrincipal();
        Page<FeedbackResponse> page = feedbackService.getMyFeedback(userId, pageable);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<FeedbackResponse>> getAllFeedback(Pageable pageable) {
        Page<FeedbackResponse> page = feedbackService.getAllFeedback(pageable);
        return ResponseEntity.ok(page);
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        feedbackService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

