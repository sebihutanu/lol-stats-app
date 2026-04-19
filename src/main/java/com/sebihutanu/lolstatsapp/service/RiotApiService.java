package com.sebihutanu.lolstatsapp.service;

import com.sebihutanu.lolstatsapp.entity.MatchSnapshot;
import com.sebihutanu.lolstatsapp.entity.TrackedPlayer;
import com.sebihutanu.lolstatsapp.exception.BadRequestException;
import com.sebihutanu.lolstatsapp.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;

@Service
public class RiotApiService {

    private static final Logger log = LoggerFactory.getLogger(RiotApiService.class);

    private final RestClient restClient;
    private final String apiKey;
    private final int matchCount;

    // America: na1, br1, la1, la2
    // Europe: euw1, eun1, tr1, ru
    // Asia: kr, jp1

    public RiotApiService(
            @Value("${riot.api.key}") String apiKey,
            @Value("${riot.api.match-count:5}") int matchCount) {
        this.apiKey = apiKey;
        this.matchCount = matchCount;
        this.restClient = RestClient.builder().build();
    }

    /**
     * Get account PUUID by Riot ID (gameName#tagLine)
     * Uses the account-v1 endpoint on the regional routing value
     */
    public Map<String, Object> getAccountByRiotId(String gameName, String tagLine, String region) {
        String regionalHost = getRegionalHost(region);
        String url = String.format("https://%s.api.riotgames.com/riot/account/v1/accounts/by-riot-id/%s/%s",
                regionalHost, gameName, tagLine);

        try {
            return restClient.get()
                    .uri(url)
                    .header("X-Riot-Token", apiKey)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});
        } catch (HttpClientErrorException.NotFound e) {
            throw new ResourceNotFoundException("Player not found: " + gameName + "#" + tagLine);
        } catch (HttpClientErrorException.Forbidden e) {
            throw new BadRequestException("Riot API key is invalid or expired");
        } catch (Exception e) {
            log.error("Error calling Riot Account API", e);
            throw new BadRequestException("Failed to fetch account from Riot API: " + e.getMessage());
        }
    }

    /**
     * Get summoner info by PUUID (for summoner level + icon)
     */
    public Map<String, Object> getSummonerByPuuid(String puuid, String region) {
        String platformHost = getPlatformHost(region);
        String url = String.format("https://%s.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/%s",
                platformHost, puuid);

        try {
            return restClient.get()
                    .uri(url)
                    .header("X-Riot-Token", apiKey)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});
        } catch (Exception e) {
            log.warn("Failed to fetch summoner data: {}", e.getMessage());
            return Map.of();
        }
    }

    /**
     * Get ranked entries by PUUID
     */
    public List<Map<String, Object>> getRankedEntries(String puuid, String region) {
        String platformHost = getPlatformHost(region);
        String url = String.format("https://%s.api.riotgames.com/lol/league/v4/entries/by-puuid/%s",
                platformHost, puuid);
        try {
            List<Map<String, Object>> result = restClient.get()
                    .uri(url)
                    .header("X-Riot-Token", apiKey)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});
            return result != null ? result : List.of();
        } catch (Exception e) {
            return List.of();
        }
    }

    /**
     * Get recent match IDs for a player.
     */
    public List<String> getRecentMatchIds(String puuid, String region) {
        String regionalHost = getRegionalHost(region);
        String url = String.format("https://%s.api.riotgames.com/lol/match/v5/matches/by-puuid/%s/ids?count=%d",
                regionalHost, puuid, matchCount);

        try {
            return restClient.get()
                    .uri(url)
                    .header("X-Riot-Token", apiKey)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});
        } catch (Exception e) {
            log.warn("Failed to fetch match IDs: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * Get match details by match ID.
     */
    public Map<String, Object> getMatchDetails(String matchId, String region) {
        String regionalHost = getRegionalHost(region);
        String url = String.format("https://%s.api.riotgames.com/lol/match/v5/matches/%s",
                regionalHost, matchId);

        try {
            return restClient.get()
                    .uri(url)
                    .header("X-Riot-Token", apiKey)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});
        } catch (Exception e) {
            log.warn("Failed to fetch match details for {}: {}", matchId, e.getMessage());
            return null;
        }
    }

    /**
     * Parse response into a MatchSnapshot
     */
    @SuppressWarnings("unchecked")
    public MatchSnapshot parseMatchToSnapshot(Map<String, Object> matchData, TrackedPlayer player) {
        try {
            Map<String, Object> info = (Map<String, Object>) matchData.get("info");
            Map<String, Object> metadata = (Map<String, Object>) matchData.get("metadata");

            String matchId = (String) metadata.get("matchId");
            List<Map<String, Object>> participants = (List<Map<String, Object>>) info.get("participants");

            Map<String, Object> participant = null;
            for (Map<String, Object> p : participants) {
                if (player.getRiotPuuid().equals(p.get("puuid"))) {
                    participant = p;
                    break;
                }
            }

            if (participant == null) {
                return null;
            }

            long gameEndTimestamp = ((Number) info.get("gameEndTimestamp")).longValue();
            LocalDateTime playedAt = LocalDateTime.ofInstant(
                    Instant.ofEpochMilli(gameEndTimestamp), ZoneId.systemDefault());

            int queueId = ((Number) info.get("queueId")).intValue();
            String queueType = mapQueueType(queueId);

            return MatchSnapshot.builder()
                    .trackedPlayer(player)
                    .riotMatchId(matchId)
                    .championName((String) participant.get("championName"))
                    .kills(((Number) participant.get("kills")).intValue())
                    .deaths(((Number) participant.get("deaths")).intValue())
                    .assists(((Number) participant.get("assists")).intValue())
                    .win((Boolean) participant.get("win"))
                    .queueType(queueType)
                    .playedAt(playedAt)
                    .build();
        } catch (Exception e) {
            log.warn("Failed to parse match data: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Populate a TrackedPlayer with ranked data
     */
    public void populateRankedData(TrackedPlayer player) {
        List<Map<String, Object>> entries = getRankedEntries(player.getRiotPuuid(), player.getRegion());
        for (Map<String, Object> entry : entries) {
            if ("RANKED_SOLO_5x5".equals(entry.get("queueType"))) {
                player.setRankedTier((String) entry.get("tier"));
                player.setRankedRank((String) entry.get("rank"));
                player.setRankedLp(((Number) entry.get("leaguePoints")).intValue());
                return;
            }
        }
    }

    private String getRegionalHost(String region) {
        return switch (region.toLowerCase()) {
            case "na1", "br1", "la1", "la2" -> "americas";
            case "euw1", "eun1", "tr1", "eune", "ru" -> "europe";
            case "kr", "jp1" -> "asia";
            case "oc1", "ph2", "sg2", "th2", "tw2", "vn2" -> "sea";
            default -> "europe";
        };
    }

    private String getPlatformHost(String region) {
        return region.toLowerCase();
    }

    private String mapQueueType(int queueId) {
        return switch (queueId) {
            case 420 -> "RANKED_SOLO";
            case 440 -> "RANKED_FLEX";
            case 400 -> "NORMAL_DRAFT";
            case 430 -> "NORMAL_BLIND";
            case 450 -> "ARAM";
            default -> "OTHER";
        };
    }
}


