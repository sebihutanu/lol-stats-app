-- Watchlist entries (many-to-many: users - tracked_players)
CREATE TABLE watchlist_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tracked_player_id UUID NOT NULL REFERENCES tracked_players(id) ON DELETE CASCADE,
    custom_note VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, tracked_player_id)
);

