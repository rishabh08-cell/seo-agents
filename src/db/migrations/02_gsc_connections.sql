-- Google Search Console connections
-- Stores OAuth tokens and selected GSC site per user

CREATE TABLE IF NOT EXISTS gsc_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      site_url TEXT NOT NULL,
        google_access_token_encrypted TEXT NOT NULL,
          google_refresh_token_encrypted TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
              updated_at TIMESTAMPTZ DEFAULT NOW(),

                UNIQUE(user_id, site_url)
                );

                CREATE INDEX idx_gsc_connections_user ON gsc_connections(user_id);

                CREATE TRIGGER trg_gsc_connections_updated_at
                  BEFORE UPDATE ON gsc_connections
                    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
