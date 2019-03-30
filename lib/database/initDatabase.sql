DROP DATABASE IF EXISTS uptime_monitor;
CREATE DATABASE uptime_monitor;

\c uptime_monitor;

-- Extend the database with TimescaleDB
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

CREATE TABLE metrics (
    time                TIMESTAMPTZ NOT NULL,
    host                TEXT        NOT NULL,
    dns_lookup_time     INT         NULL,
    tcp_connection_time INT         NULL,
    tls_handshake_time  INT         NULL,
    ttfb                INT         NULL,
    transfert_time      INT         NULL,
    total_time          INT         NULL,
    status_code         SMALLINT    NULL
);

-- Create hypertable for metrics table
SELECT create_hypertable('metrics', 'time');

-- Create index for the metrics table
CREATE INDEX ON metrics (host, time DESC);

CREATE TABLE alerts (
    time            TIMESTAMPTZ     NOT NULL,
    host            TEXT            NOT NULL,
    state           TEXT            NOT NULL,
    availability    NUMERIC(4, 3)   NOT NULL
);

SELECT create_hypertable('alerts', 'time');