const screen = require('./screen');
const dbQuery = require('./databaseQueries');
const config = require('../config/config');

screen.initScreen();

// Short period update
setInterval(async () => {
    screen.updateAvailability('short');
    screen.updateResponseTimes('short');
    screen.updateStatusCode('short');
}, config.dashboard.checkStatsIntervals.short.checkInterval);

// Long period update
setInterval(async () => {
    screen.updateAvailability('long');
    screen.updateResponseTimes('long');
    screen.updateStatusCode('long');
}, config.dashboard.checkStatsIntervals.long.checkInterval);

// Alerts history update
setInterval(async () => {
    const alerts = await dbQuery.getAlerts();

    alerts.forEach((alert) => {
        screen.updateAlerts(alert);
    });
}, config.dashboard.checkAlertInterval);
