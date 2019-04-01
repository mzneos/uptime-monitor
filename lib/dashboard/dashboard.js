const screen = require('./screen');
const dbQuery = require('./databaseQueries');
const config = require('../config/config');

screen.initScreen();

setInterval(async () => {
    screen.updateAvailability('short');
    screen.updateResponseTimes('short');
    screen.updateStatusCode('short');
}, config.dashboard.checkStatsIntervals.short.checkInterval);

setInterval(async () => {
    const alerts = await dbQuery.getAlerts();

    alerts.forEach((alert) => {
        screen.updateAlerts(alert);
    });
}, config.dashboard.checkAlertInterval);
