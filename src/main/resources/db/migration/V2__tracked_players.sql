-- Tracked Players table (LoL players imported from Riot API)
CREATE TABLE tracked_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    riot_puuid VARCHAR(255) UNIQUE,
    game_name VARCHAR(255) NOT NULL,
    tag_line VARCHAR(255) NOT NULL,
    region VARCHAR(50) NOT NULL,
    summoner_level INTEGER,
    profile_icon_id INTEGER,
    ranked_tier VARCHAR(50),
    ranked_rank VARCHAR(10),
    ranked_lp INTEGER,
    last_synced_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

