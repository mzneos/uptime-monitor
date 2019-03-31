/*
*   Make requests to the database
*/
const humanizeDuration = require('humanize-duration');

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
        console.log('Unable to get alerts from database.');
        console.log(err);

        return [];
    }
};

const getResponseTimes = async (host, period) => {
    try {
        const result = await db.one('SELECT avg(dns_lookup_time) as avg_dns, avg(tcp_connection_time) as avg_tcp, '
            + 'avg(tls_handshake_time) as avg_tls, avg(ttfb) as avg_ttfb, avg(transfert_time) as avg_transfer, '
            + 'avg(total_time) as avg_total, max(dns_lookup_time) as max_dns, max(tcp_connection_time) as max_tcp, '
            + 'max(tls_handshake_time) as max_tls, max(ttfb) as max_ttfb, max(transfert_time) as max_transfer, '
            + 'max(total_time) as max_total FROM metrics WHERE host = $(host) AND time > NOW() - interval $(period)', {
            host,
            period: humanizeDuration(period),
        });

        return result;
    } catch (err) {
        console.log(`Unable to get responseTimes from host ${host}.`);
        console.log(err);

        return undefined;
    }
};

module.exports = {
    getAlerts,
    getResponseTimes,
};
