package com.sebihutanu.lolstatsapp.service;

import com.sebihutanu.lolstatsapp.dto.TrackedPlayerRequest;
import com.sebihutanu.lolstatsapp.dto.TrackedPlayerResponse;
import com.sebihutanu.lolstatsapp.entity.TrackedPlayer;
import com.sebihutanu.lolstatsapp.exception.BadRequestException;
import com.sebihutanu.lolstatsapp.exception.ResourceNotFoundException;
import com.sebihutanu.lolstatsapp.repository.TrackedPlayerRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class TrackedPlayerService {

    private final TrackedPlayerRepository trackedPlayerRepository;

    public TrackedPlayerService(TrackedPlayerRepository trackedPlayerRepository) {
        this.trackedPlayerRepository = trackedPlayerRepository;
    }

    public TrackedPlayerResponse create(TrackedPlayerRequest request) {
        trackedPlayerRepository
                .findByGameNameAndTagLineAndRegion(request.getGameName(), request.getTagLine(), request.getRegion())
                .ifPresent(p -> {
                    throw new BadRequestException("Player already tracked: " + p.getGameName() + "#" + p.getTagLine());
                });

        TrackedPlayer player = TrackedPlayer.builder()
                .gameName(request.getGameName())
                .tagLine(request.getTagLine())
                .region(request.getRegion())
                .build();

        player = trackedPlayerRepository.save(player);
        return mapToResponse(player);
    }

    public TrackedPlayerResponse getById(UUID id) {
        TrackedPlayer player = trackedPlayerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tracked player not found"));
        return mapToResponse(player);
    }

    public Page<TrackedPlayerResponse> getAll(Pageable pageable) {
        return trackedPlayerRepository.findAll(pageable).map(this::mapToResponse);
    }

    public Page<TrackedPlayerResponse> search(String query, Pageable pageable) {
        return trackedPlayerRepository.searchByGameName(query, pageable).map(this::mapToResponse);
    }

    public TrackedPlayerResponse update(UUID id, TrackedPlayerRequest request) {
        TrackedPlayer player = trackedPlayerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tracked player not found"));

        player.setGameName(request.getGameName());
        player.setTagLine(request.getTagLine());
        player.setRegion(request.getRegion());

        player = trackedPlayerRepository.save(player);
        return mapToResponse(player);
    }

    public void delete(UUID id) {
        if (!trackedPlayerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tracked player not found");
        }
        trackedPlayerRepository.deleteById(id);
    }

    private TrackedPlayerResponse mapToResponse(TrackedPlayer player) {
        return TrackedPlayerResponse.builder()
                .id(player.getId())
                .riotPuuid(player.getRiotPuuid())
                .gameName(player.getGameName())
                .tagLine(player.getTagLine())
                .region(player.getRegion())
                .summonerLevel(player.getSummonerLevel())
                .profileIconId(player.getProfileIconId())
                .rankedTier(player.getRankedTier())
                .rankedRank(player.getRankedRank())
                .rankedLp(player.getRankedLp())
                .lastSyncedAt(player.getLastSyncedAt())
                .createdAt(player.getCreatedAt())
                .build();
    }
}

