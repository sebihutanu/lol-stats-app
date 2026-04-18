-- Match snapshots (matches saved per tracked player)
CREATE TABLE match_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracked_player_id UUID NOT NULL REFERENCES tracked_players(id) ON DELETE CASCADE,
    riot_match_id VARCHAR(255),
    champion_name VARCHAR(100) NOT NULL,
    kills INTEGER NOT NULL DEFAULT 0,
    deaths INTEGER NOT NULL DEFAULT 0,
    assists INTEGER NOT NULL DEFAULT 0,
    win BOOLEAN NOT NULL,
    queue_type VARCHAR(100),
    played_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(tracked_player_id, riot_match_id)
);

