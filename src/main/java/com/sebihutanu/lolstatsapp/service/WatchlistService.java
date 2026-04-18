package com.sebihutanu.lolstatsapp.service;

import com.sebihutanu.lolstatsapp.dto.TrackedPlayerResponse;
import com.sebihutanu.lolstatsapp.dto.WatchlistEntryRequest;
import com.sebihutanu.lolstatsapp.dto.WatchlistEntryResponse;
import com.sebihutanu.lolstatsapp.entity.TrackedPlayer;
import com.sebihutanu.lolstatsapp.entity.User;
import com.sebihutanu.lolstatsapp.entity.WatchlistEntry;
import com.sebihutanu.lolstatsapp.exception.BadRequestException;
import com.sebihutanu.lolstatsapp.exception.ResourceNotFoundException;
import com.sebihutanu.lolstatsapp.repository.TrackedPlayerRepository;
import com.sebihutanu.lolstatsapp.repository.UserRepository;
import com.sebihutanu.lolstatsapp.repository.WatchlistEntryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class WatchlistService {

    private final WatchlistEntryRepository watchlistEntryRepository;
    private final UserRepository userRepository;
    private final TrackedPlayerRepository trackedPlayerRepository;

    public WatchlistService(WatchlistEntryRepository watchlistEntryRepository,
                            UserRepository userRepository,
                            TrackedPlayerRepository trackedPlayerRepository) {
        this.watchlistEntryRepository = watchlistEntryRepository;
        this.userRepository = userRepository;
        this.trackedPlayerRepository = trackedPlayerRepository;
    }

    public WatchlistEntryResponse addToWatchlist(UUID userId, WatchlistEntryRequest request) {
        if (watchlistEntryRepository.existsByUserIdAndTrackedPlayerId(userId, request.getTrackedPlayerId())) {
            throw new BadRequestException("Player is already in your watchlist");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        TrackedPlayer player = trackedPlayerRepository.findById(request.getTrackedPlayerId())
                .orElseThrow(() -> new ResourceNotFoundException("Tracked player not found"));

        WatchlistEntry entry = WatchlistEntry.builder()
                .user(user)
                .trackedPlayer(player)
                .customNote(request.getCustomNote())
                .build();

        entry = watchlistEntryRepository.save(entry);
        return mapToResponse(entry);
    }

    public Page<WatchlistEntryResponse> getMyWatchlist(UUID userId, Pageable pageable) {
        return watchlistEntryRepository.findByUserId(userId, pageable).map(this::mapToResponse);
    }

    public WatchlistEntryResponse updateNote(UUID userId, UUID entryId, String customNote) {
        WatchlistEntry entry = watchlistEntryRepository.findById(entryId)
                .orElseThrow(() -> new ResourceNotFoundException("Watchlist entry not found"));

        if (!entry.getUser().getId().equals(userId)) {
            throw new BadRequestException("You can only edit your own watchlist entries");
        }

        entry.setCustomNote(customNote);
        entry = watchlistEntryRepository.save(entry);
        return mapToResponse(entry);
    }

    public void removeFromWatchlist(UUID userId, UUID entryId) {
        WatchlistEntry entry = watchlistEntryRepository.findById(entryId)
                .orElseThrow(() -> new ResourceNotFoundException("Watchlist entry not found"));

        if (!entry.getUser().getId().equals(userId)) {
            throw new BadRequestException("You can only remove your own watchlist entries");
        }

        watchlistEntryRepository.delete(entry);
    }

    private WatchlistEntryResponse mapToResponse(WatchlistEntry entry) {
        TrackedPlayer p = entry.getTrackedPlayer();

        TrackedPlayerResponse playerResponse = TrackedPlayerResponse.builder()
                .id(p.getId())
                .riotPuuid(p.getRiotPuuid())
                .gameName(p.getGameName())
                .tagLine(p.getTagLine())
                .region(p.getRegion())
                .summonerLevel(p.getSummonerLevel())
                .profileIconId(p.getProfileIconId())
                .rankedTier(p.getRankedTier())
                .rankedRank(p.getRankedRank())
                .rankedLp(p.getRankedLp())
                .lastSyncedAt(p.getLastSyncedAt())
                .createdAt(p.getCreatedAt())
                .build();

        return WatchlistEntryResponse.builder()
                .id(entry.getId())
                .customNote(entry.getCustomNote())
                .createdAt(entry.getCreatedAt())
                .trackedPlayer(playerResponse)
                .build();
    }
}

