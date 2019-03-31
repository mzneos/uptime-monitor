/*
*   Make requests to the database
*/

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

module.exports = {
    getAlerts,
};
