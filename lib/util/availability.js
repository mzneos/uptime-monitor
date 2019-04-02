/*
*   Computes the availability of specified host for a specific time interval
*/
const humanizeDuration = require('humanize-duration');
const log = require('simple-node-logger').createSimpleFileLogger(`${__dirname.substring(0, __dirname.lastIndexOf('/'))}`
    + '/log/database.log');

const db = require('../database/index');

const getAvailability = async (host, interval) => {
    try {
        const data = await db.any('SELECT COUNT(status_code) FROM metrics WHERE host = $(host) '
            + 'AND status_code = 200 AND time > NOW() - interval $(interval)', {
            host,
            interval: humanizeDuration(interval),
        });

        return data[0].count * 1000 / interval;
    } catch (err) {
        log.error(err);
        return undefined;
    }
};

module.exports = getAvailability;
