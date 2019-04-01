/*
*   Handles the alerting logic
*/

const log = require('simple-node-logger').createSimpleFileLogger(`${__dirname.substring(0, __dirname.lastIndexOf('/'))}`
    + '/log/process.log');

const db = require('../database/index');
const getAvailability = require('../database/availability');
const config = require('../config/config');

// Initialize alersState with each host in config.fetch.websites
const alertsState = {};
Object.keys(config.fetch.websites).forEach((host) => {
    alertsState[host] = 'available';
});

const insertAlert = async (host, time, state, availability) => {
    try {
        await db.none('INSERT INTO alerts VALUES ($(time), $(host), $(state), $(availability));', {
            time,
            host,
            state,
            availability,
        });
    } catch (err) {
        log.error(`Unable to store alert for host ${host} in database`);
        log.error(err);
    }
};

/* Check a host's availability and update the alerts table accordingly */
const updateAlertHistory = async (host, duration) => {
    try {
        const availability = await getAvailability(host, duration);

        if (availability < 0.800 && alertsState[host] !== 'triggered') {
            try {
                await insertAlert(host, new Date(), 'triggered', availability);
                alertsState[host] = 'triggered';

                log.info(`Website ${host} is down.\tavailability = ${availability}\ttime=${new Date()}`);
            } catch (err) {
                log.error(err);
            }
        } else if (availability >= 0.800 && alertsState[host] === 'triggered') {
            try {
                await insertAlert(host, new Date(), 'recovered', availability);
                alertsState[host] = 'recovered';

                log.info(`Website ${host} is up.\tavailability = ${availability}\ttime=${new Date()}`);
            } catch (err) {
                log.error(err);
            }
        }
    } catch (err) {
        log.error(err);
    }
};

/* Initialize alertsState for a specific host, checking in the alerts table for previous unrecovered alerts */
const initAlertState = async (host) => {
    try {
        const hostState = await db.oneOrNone('SELECT state from alerts WHERE host = $(host) ORDER BY time DESC limit 1;', {
            host,
        });

        if (hostState) {
            alertsState[host] = hostState.state;
        }
        log.info(`State initialized for host ${host}.`);
    } catch (err) {
        log.error(`Unable to initialize state for host ${host}`);
        log.error(err);
    }
};

module.exports = {
    updateAlertHistory,
    initAlertState,
};
