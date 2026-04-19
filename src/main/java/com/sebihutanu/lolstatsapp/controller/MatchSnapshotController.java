package com.sebihutanu.lolstatsapp.controller;

import com.sebihutanu.lolstatsapp.dto.MatchSnapshotRequest;
import com.sebihutanu.lolstatsapp.dto.MatchSnapshotResponse;
import com.sebihutanu.lolstatsapp.service.MatchSnapshotService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/players/{playerId}/matches")
public class MatchSnapshotController {

    private final MatchSnapshotService matchSnapshotService;

    public MatchSnapshotController(MatchSnapshotService matchSnapshotService) {
        this.matchSnapshotService = matchSnapshotService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<MatchSnapshotResponse> create(
            @PathVariable UUID playerId,
            @Valid @RequestBody MatchSnapshotRequest request) {
        MatchSnapshotResponse response = matchSnapshotService.create(playerId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<MatchSnapshotResponse>> getMatches(
            @PathVariable UUID playerId,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        Page<MatchSnapshotResponse> page = matchSnapshotService.getMatchesByPlayer(playerId, search, pageable);
        return ResponseEntity.ok(page);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{matchId}")
    public ResponseEntity<Void> delete(@PathVariable UUID playerId, @PathVariable UUID matchId) {
        matchSnapshotService.delete(matchId);
        return ResponseEntity.noContent().build();
    }
}

