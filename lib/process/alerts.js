/*
*   Handles the alerting logic
*/

const db = require('../database/index');
const getAvailability = require('../database/availability');
const config = require('../config/config');

const alertsState = {
    [config.fetch.monitoredUrl]: 'available',
};

const insertAlert = async (host, time, state, availability) => {
    try {
        await db.none('INSERT INTO alerts(time, host, state, availability) '
            + 'VALUES ($(time), $(host), $(state), $(availability));', {
            time,
            host,
            state,
            availability,
        });
    } catch (err) {
        console.log(`Unable to store alert for host ${host} in database`);
        console.log(err);
    }
};

const updateAlertHistory = async (host, duration) => {
    try {
        const availability = await getAvailability(host, duration);
        console.log(availability);

        if (availability < 0.800 && alertsState[host] !== 'triggered') {
            try {
                await insertAlert(host, new Date(), 'triggered', availability);
                alertsState[host] = 'triggered';

                console.log(`Website ${host} is down.\tavailability = ${availability}\ttime=${new Date()}`);
            } catch (err) {
                console.log(err);
            }
        } else if (availability >= 0.800 && alertsState[host] === 'triggered') {
            try {
                await insertAlert(host, new Date(), 'recovered', availability);
                alertsState[host] = 'recovered';

                console.log(`Website ${host} is up.\tavailability = ${availability}\ttime=${new Date()}`);
            } catch (err) {
                console.log(err);
            }
        }
    } catch (err) {
        console.log(err);
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
        console.log(`State initialized for host ${host}.`);
    } catch (err) {
        console.log(`Unable to initialize state for host ${host}`);
        console.log(err);
    }
};

module.exports = {
    updateAlertHistory,
    initAlertState,
};
