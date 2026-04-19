package com.sebihutanu.lolstatsapp.service;

import com.sebihutanu.lolstatsapp.dto.TrackedPlayerRequest;
import com.sebihutanu.lolstatsapp.dto.TrackedPlayerResponse;
import com.sebihutanu.lolstatsapp.entity.MatchSnapshot;
import com.sebihutanu.lolstatsapp.entity.TrackedPlayer;
import com.sebihutanu.lolstatsapp.exception.BadRequestException;
import com.sebihutanu.lolstatsapp.exception.ResourceNotFoundException;
import com.sebihutanu.lolstatsapp.repository.MatchSnapshotRepository;
import com.sebihutanu.lolstatsapp.repository.TrackedPlayerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class TrackedPlayerService {

    private static final Logger log = LoggerFactory.getLogger(TrackedPlayerService.class);

    private final TrackedPlayerRepository trackedPlayerRepository;
    private final MatchSnapshotRepository matchSnapshotRepository;
    private final RiotApiService riotApiService;

    public TrackedPlayerService(TrackedPlayerRepository trackedPlayerRepository,
                                MatchSnapshotRepository matchSnapshotRepository,
                                RiotApiService riotApiService) {
        this.trackedPlayerRepository = trackedPlayerRepository;
        this.matchSnapshotRepository = matchSnapshotRepository;
        this.riotApiService = riotApiService;
    }

    /**
     * Search a player via Riot API, save or update in DB, fetch ranked and recent matches
     */
    public TrackedPlayerResponse searchAndSync(String gameName, String tagLine, String region) {
        // 1. Call Riot Account API to get PUUID
        Map<String, Object> account = riotApiService.getAccountByRiotId(gameName, tagLine, region);
        String puuid = (String) account.get("puuid");

        // 2. Find or create TrackedPlayer
        TrackedPlayer player = trackedPlayerRepository.findByRiotPuuid(puuid)
                .orElseGet(() -> trackedPlayerRepository.findByGameNameAndTagLineAndRegion(gameName, tagLine, region)
                        .orElseGet(() -> TrackedPlayer.builder()
                                .gameName(gameName)
                                .tagLine(tagLine)
                                .region(region)
                                .build()));

        player.setRiotPuuid(puuid);
        player.setGameName((String) account.getOrDefault("gameName", gameName));
        player.setTagLine((String) account.getOrDefault("tagLine", tagLine));

        // 3. Get summoner data
        Map<String, Object> summoner = riotApiService.getSummonerByPuuid(puuid, region);
        log.info("Summoner response keys: {}", summoner.keySet());
        log.info("Summoner response: {}", summoner);
        if (!summoner.isEmpty()) {
            player.setSummonerLevel(((Number) summoner.getOrDefault("summonerLevel", 0)).intValue());
            player.setProfileIconId(((Number) summoner.getOrDefault("profileIconId", 0)).intValue());

            // 4. Get ranked data
            riotApiService.populateRankedData(player);
            log.info("After ranked populate - tier: {}, rank: {}, lp: {}",
                    player.getRankedTier(), player.getRankedRank(), player.getRankedLp());
        } else {
            log.warn("Summoner response was empty, skipping ranked data");
        }

        player.setLastSyncedAt(LocalDateTime.now());
        player = trackedPlayerRepository.save(player);

        // 5. Fetch recent matches and save snapshots
        fetchAndSaveMatches(player);

        return mapToResponse(player);
    }

    private void fetchAndSaveMatches(TrackedPlayer player) {
        List<String> matchIds = riotApiService.getRecentMatchIds(player.getRiotPuuid(), player.getRegion());
        for (String matchId : matchIds) {
            // Skip if already saved
            if (matchSnapshotRepository.existsByTrackedPlayerIdAndRiotMatchId(player.getId(), matchId)) {
                continue;
            }
            Map<String, Object> matchData = riotApiService.getMatchDetails(matchId, player.getRegion());
            if (matchData == null) continue;

            MatchSnapshot snapshot = riotApiService.parseMatchToSnapshot(matchData, player);
            if (snapshot != null) {
                matchSnapshotRepository.save(snapshot);
                log.info("Saved match snapshot: {} for player {}", matchId, player.getGameName());
            }
        }
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

