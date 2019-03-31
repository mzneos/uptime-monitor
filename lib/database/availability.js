/*
*   Compute the availability
*/
const humanizeDuration = require('humanize-duration');

const db = require('./index');

const getAvailability = async (host, interval) => {
    try {
        const data = await db.any('SELECT COUNT(status_code) FROM metrics WHERE host = $(host) '
            + 'AND status_code = 200 AND time > NOW() - interval $(interval)', {
            host,
            interval: humanizeDuration(interval),
        });

        return data[0].count * 1000 / interval;
    } catch (err) {
        console.log(err);
        return undefined;
    }
};

module.exports = getAvailability;