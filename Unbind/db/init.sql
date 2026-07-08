-- Unbind Postgres 스키마 초기화 스크립트.
-- 로컬: docker exec -i unbind-postgres psql -U unbind_app -d unbind < init.sql
-- Supabase: 대시보드의 SQL Editor에 이 내용을 그대로 붙여넣고 실행

CREATE TABLE users (
	id               BIGINT PRIMARY KEY,
	email            VARCHAR(100) NOT NULL UNIQUE,
	password         VARCHAR(255) NOT NULL,
	name             VARCHAR(50),
	created_at       TIMESTAMP,
	is_pro           SMALLINT NOT NULL DEFAULT 0,
	name_changed_at  TIMESTAMP
);

CREATE TABLE journal_entry (
	id                BIGINT PRIMARY KEY,
	situation_text    TEXT,
	created_at        TIMESTAMP,
	user_id           BIGINT REFERENCES users(id),
	relationship_tag  VARCHAR(50)
);

CREATE TABLE conversation_turn (
	id          BIGINT PRIMARY KEY,
	entry_id    BIGINT NOT NULL REFERENCES journal_entry(id),
	role        VARCHAR(20),
	content     TEXT,
	step_type   VARCHAR(20),
	turn_order  INTEGER
);

CREATE TABLE action_item (
	id            BIGINT PRIMARY KEY,
	entry_id      BIGINT NOT NULL REFERENCES journal_entry(id),
	content       VARCHAR(200),
	is_completed  SMALLINT,
	feedback      VARCHAR(20)
);

CREATE TABLE constellation (
	id       BIGINT PRIMARY KEY,
	user_id  BIGINT NOT NULL REFERENCES users(id),
	tag      VARCHAR(50) NOT NULL,
	name     VARCHAR(50),
	UNIQUE (user_id, tag)
);

CREATE TABLE forest_knot (
	id                BIGINT PRIMARY KEY,
	user_id           BIGINT NOT NULL REFERENCES users(id),
	action_item_id    BIGINT NOT NULL UNIQUE REFERENCES action_item(id),
	tag               VARCHAR(50),
	situation_summary TEXT,
	action_text       VARCHAR(300),
	created_at        TIMESTAMP
);

CREATE TABLE forest_reaction (
	id             BIGINT PRIMARY KEY,
	forest_knot_id BIGINT NOT NULL REFERENCES forest_knot(id),
	user_id        BIGINT NOT NULL REFERENCES users(id),
	action_text    VARCHAR(300),
	created_at     TIMESTAMP,
	updated_at     TIMESTAMP
);

CREATE TABLE feedback (
	id          BIGINT PRIMARY KEY,
	user_id     BIGINT NOT NULL REFERENCES users(id),
	content     TEXT NOT NULL,
	created_at  TIMESTAMP
);

CREATE TABLE forest_scrap (
	id             BIGINT PRIMARY KEY,
	user_id        BIGINT NOT NULL REFERENCES users(id),
	forest_knot_id BIGINT NOT NULL REFERENCES forest_knot(id),
	memo           VARCHAR(300),
	created_at     TIMESTAMP,
	updated_at     TIMESTAMP,
	UNIQUE (user_id, forest_knot_id)
);

CREATE SEQUENCE user_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE journal_entry_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE conversation_turn_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE action_item_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE constellation_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE forest_knot_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE forest_reaction_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE feedback_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE forest_scrap_seq START WITH 1 INCREMENT BY 1;
