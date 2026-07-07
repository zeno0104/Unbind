-- Unbind Postgres 스키마 초기화 스크립트.
-- 로컬: docker exec -i unbind-postgres psql -U unbind_app -d unbind < init.sql
-- Supabase: 대시보드의 SQL Editor에 이 내용을 그대로 붙여넣고 실행

CREATE TABLE users (
	id          BIGINT PRIMARY KEY,
	email       VARCHAR(100) NOT NULL UNIQUE,
	password    VARCHAR(255) NOT NULL,
	name        VARCHAR(50),
	created_at  TIMESTAMP,
	is_pro      SMALLINT NOT NULL DEFAULT 0
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

CREATE SEQUENCE user_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE journal_entry_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE conversation_turn_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE action_item_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE constellation_seq START WITH 1 INCREMENT BY 1;
