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
    status_code         SMALLINT    NULL,
    available           BOOL        NULL
);

-- Create hypertable for metrics table
SELECT create_hyptertable('metrics', 'time');

-- Create index for the metrics table
CREATE INDEX ON metrics (host, time DESC);
