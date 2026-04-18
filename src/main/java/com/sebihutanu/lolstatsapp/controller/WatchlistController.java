package com.sebihutanu.lolstatsapp.controller;

import com.sebihutanu.lolstatsapp.dto.WatchlistEntryRequest;
import com.sebihutanu.lolstatsapp.dto.WatchlistEntryResponse;
import com.sebihutanu.lolstatsapp.service.WatchlistService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/watchlist")
public class WatchlistController {

    private final WatchlistService watchlistService;

    public WatchlistController(WatchlistService watchlistService) {
        this.watchlistService = watchlistService;
    }

    @PostMapping
    public ResponseEntity<WatchlistEntryResponse> add(
            Authentication authentication,
            @Valid @RequestBody WatchlistEntryRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        WatchlistEntryResponse response = watchlistService.addToWatchlist(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<WatchlistEntryResponse>> getMyWatchlist(
            Authentication authentication,
            Pageable pageable) {
        UUID userId = (UUID) authentication.getPrincipal();
        Page<WatchlistEntryResponse> page = watchlistService.getMyWatchlist(userId, pageable);
        return ResponseEntity.ok(page);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WatchlistEntryResponse> updateNote(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        UUID userId = (UUID) authentication.getPrincipal();
        String customNote = body.get("customNote");
        WatchlistEntryResponse response = watchlistService.updateNote(userId, id, customNote);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(
            Authentication authentication,
            @PathVariable UUID id) {
        UUID userId = (UUID) authentication.getPrincipal();
        watchlistService.removeFromWatchlist(userId, id);
        return ResponseEntity.noContent().build();
    }
}

