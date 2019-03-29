/*
*   Handles the insertion of metrics into the database
*/

const db = require('../database/index');

const insertMetrics = async (metrics) => {
    try {
        await db.none('INSERT INTO metrics(time, host, dns_lookup_time, tcp_connection_time,'
            + 'tls_handshake_time, ttfb, transfert_time, total_time, status_code)'
            + 'VALUES ($(time), $(host), $(dnsLookup), $(tcpConnection), $(tlsHandshake),'
            + '$(ttfb), $(transfer), $(total), $(statusCode));', {
            time: metrics.time,
            host: metrics.host,
            dnsLookup: metrics.responseTimes.dnsLookup,
            tcpConnection: metrics.responseTimes.tcpConnection,
            tlsHandshake: metrics.responseTimes.tlsHandshake,
            ttfb: metrics.responseTimes.firstByte,
            transfer: metrics.responseTimes.transfer,
            total: metrics.responseTimes.total,
            statusCode: metrics.statusCode,
        });
    } catch (err) {
        console.log(`Unable to store metrics for host ${metrics.host}`);
        console.log(err);
    }
};

module.exports = insertMetrics;
