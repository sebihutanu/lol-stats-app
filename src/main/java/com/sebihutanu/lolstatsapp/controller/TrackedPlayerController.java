package com.sebihutanu.lolstatsapp.controller;

import com.sebihutanu.lolstatsapp.dto.TrackedPlayerRequest;
import com.sebihutanu.lolstatsapp.dto.TrackedPlayerResponse;
import com.sebihutanu.lolstatsapp.service.TrackedPlayerService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/players")
public class TrackedPlayerController {

    private final TrackedPlayerService trackedPlayerService;

    public TrackedPlayerController(TrackedPlayerService trackedPlayerService) {
        this.trackedPlayerService = trackedPlayerService;
    }

    @PostMapping
    public ResponseEntity<TrackedPlayerResponse> create(@Valid @RequestBody TrackedPlayerRequest request) {
        TrackedPlayerResponse response = trackedPlayerService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrackedPlayerResponse> getById(@PathVariable UUID id) {
        TrackedPlayerResponse response = trackedPlayerService.getById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Page<TrackedPlayerResponse>> getAll(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        Page<TrackedPlayerResponse> page;
        if (search != null && !search.isBlank()) {
            page = trackedPlayerService.search(search, pageable);
        } else {
            page = trackedPlayerService.getAll(pageable);
        }
        return ResponseEntity.ok(page);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrackedPlayerResponse> update(@PathVariable UUID id, @Valid @RequestBody TrackedPlayerRequest request) {
        TrackedPlayerResponse response = trackedPlayerService.update(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        trackedPlayerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

