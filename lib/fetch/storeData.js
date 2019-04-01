/*
*   Handles the insertion of metrics into the database
*/

const log = require('simple-node-logger').createSimpleFileLogger(`${__dirname.substring(0, __dirname.lastIndexOf('/'))}`
    + '/log/fetch.log');

const db = require('../database/index');

const insertMetrics = async (metrics) => {
    try {
        await db.none('INSERT INTO metrics VALUES ($(time), $(host), $(dnsLookup), $(tcpConnection), $(tlsHandshake),'
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
        log.error(`Unable to store metrics for host ${metrics.host}`);
        log.error(err);
    }
};

module.exports = insertMetrics;
