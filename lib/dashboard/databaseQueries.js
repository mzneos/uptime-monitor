/*
*   Make requests to the database
*/
const humanizeDuration = require('humanize-duration');
const log = require('simple-node-logger').createSimpleFileLogger(`${__dirname.substring(0, __dirname.lastIndexOf('/'))}`
    + '/log/database.log');

const db = require('../database/index');

let lastCheckTime;

const getAlerts = async () => {
    try {
        const currentTime = new Date();
        const results = await db.any('SELECT * FROM alerts WHERE time > $(lastCheckTime)', {
            currentTime,
            lastCheckTime,
        });

        lastCheckTime = currentTime;

        return results;
    } catch (err) {
        log.error('Unable to get alerts from database.');
        log.error(err);

        return [];
    }
};

const getResponseTimes = async (host, period) => {
    try {
        const result = await db.one('SELECT avg(dns_lookup_time) as avg_dns, avg(tcp_connection_time) as avg_tcp, '
            + 'avg(tls_handshake_time) as avg_tls, avg(ttfb) as avg_ttfb, avg(transfer_time) as avg_transfer, '
            + 'avg(total_time) as avg_total, max(dns_lookup_time) as max_dns, max(tcp_connection_time) as max_tcp, '
            + 'max(tls_handshake_time) as max_tls, max(ttfb) as max_ttfb, max(transfer_time) as max_transfer, '
            + 'max(total_time) as max_total FROM metrics WHERE host = $(host) AND time > NOW() - interval $(period)', {
            host,
            period: humanizeDuration(period),
        });

        return result;
    } catch (err) {
        log.error(`Unable to get responseTimes from host ${host}.`);
        log.error(err);

        return undefined;
    }
};

const getStatusCodeCounts = async (host, period) => {
    try {
        const result = await db.one('SELECT '
        + 'COUNT(CASE status_code WHEN 200 THEN 1 ELSE NULL END) as count_200, '
        + 'COUNT(CASE status_code WHEN 502 THEN 1 ELSE NULL END) as count_502 '
        + 'FROM metrics WHERE host = $(host) AND time > NOW() - interval $(period)', {
            host,
            period: humanizeDuration(period),
        });

        return result;
    } catch (err) {
        log.error(`Unable to get status code counts from host ${host}.`);
        log.error(err);
        return undefined;
    }
};

module.exports = {
    getAlerts,
    getResponseTimes,
    getStatusCodeCounts,
};
