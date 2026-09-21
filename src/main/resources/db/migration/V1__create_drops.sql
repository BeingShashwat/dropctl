CREATE TABLE drops (
                       drop_id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                       slug               VARCHAR(32)  NOT NULL,
                       original_file_name VARCHAR(255) NOT NULL,
                       storage_key        VARCHAR(255) NOT NULL,
                       content_type       VARCHAR(255) NOT NULL,
                       size_bytes         BIGINT       NOT NULL,
                       created_at         TIMESTAMPTZ  NOT NULL,
                       expires_at         TIMESTAMPTZ  NOT NULL,
                       CONSTRAINT uq_drops_slug UNIQUE (slug)
);

CREATE INDEX idx_drops_expires_at ON drops (expires_at);