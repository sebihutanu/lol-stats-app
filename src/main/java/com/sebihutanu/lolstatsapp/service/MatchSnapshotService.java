package com.sebihutanu.lolstatsapp.service;

import com.sebihutanu.lolstatsapp.dto.MatchSnapshotRequest;
import com.sebihutanu.lolstatsapp.dto.MatchSnapshotResponse;
import com.sebihutanu.lolstatsapp.entity.MatchSnapshot;
import com.sebihutanu.lolstatsapp.entity.TrackedPlayer;
import com.sebihutanu.lolstatsapp.exception.ResourceNotFoundException;
import com.sebihutanu.lolstatsapp.repository.MatchSnapshotRepository;
import com.sebihutanu.lolstatsapp.repository.TrackedPlayerRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class MatchSnapshotService {

    private final MatchSnapshotRepository matchSnapshotRepository;
    private final TrackedPlayerRepository trackedPlayerRepository;

    public MatchSnapshotService(MatchSnapshotRepository matchSnapshotRepository,
                                TrackedPlayerRepository trackedPlayerRepository) {
        this.matchSnapshotRepository = matchSnapshotRepository;
        this.trackedPlayerRepository = trackedPlayerRepository;
    }

    public MatchSnapshotResponse create(UUID playerId, MatchSnapshotRequest request) {
        TrackedPlayer player = trackedPlayerRepository.findById(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Tracked player not found"));

        MatchSnapshot snapshot = MatchSnapshot.builder()
                .trackedPlayer(player)
                .riotMatchId(request.getRiotMatchId())
                .championName(request.getChampionName())
                .kills(request.getKills())
                .deaths(request.getDeaths())
                .assists(request.getAssists())
                .win(request.getWin())
                .queueType(request.getQueueType())
                .playedAt(request.getPlayedAt())
                .build();

        snapshot = matchSnapshotRepository.save(snapshot);
        return mapToResponse(snapshot);
    }

    public Page<MatchSnapshotResponse> getMatchesByPlayer(UUID playerId, String search, Pageable pageable) {
        if (!trackedPlayerRepository.existsById(playerId)) {
            throw new ResourceNotFoundException("Tracked player not found");
        }

        if (search != null && !search.isBlank()) {
            return matchSnapshotRepository.searchByChampion(playerId, search, pageable).map(this::mapToResponse);
        }
        return matchSnapshotRepository.findByTrackedPlayerIdOrderByPlayedAtDesc(playerId, pageable).map(this::mapToResponse);
    }

    public void delete(UUID matchId) {
        if (!matchSnapshotRepository.existsById(matchId)) {
            throw new ResourceNotFoundException("Match snapshot not found");
        }
        matchSnapshotRepository.deleteById(matchId);
    }

    private MatchSnapshotResponse mapToResponse(MatchSnapshot snapshot) {
        return MatchSnapshotResponse.builder()
                .id(snapshot.getId())
                .riotMatchId(snapshot.getRiotMatchId())
                .championName(snapshot.getChampionName())
                .kills(snapshot.getKills())
                .deaths(snapshot.getDeaths())
                .assists(snapshot.getAssists())
                .win(snapshot.getWin())
                .queueType(snapshot.getQueueType())
                .playedAt(snapshot.getPlayedAt())
                .createdAt(snapshot.getCreatedAt())
                .build();
    }
}

