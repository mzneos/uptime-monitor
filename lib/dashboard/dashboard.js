const screen = require('./screen');
const dbQuery = require('./databaseQueries');
const config = require('../config/config');

screen.initScreen();

setInterval(async () => {
    screen.updateShortAvailability();
}, config.dashboard.checkStatsIntervals.shortPeriod.checkInterval);

setInterval(async () => {
    const alerts = await dbQuery.getAlerts();

    alerts.forEach((alert) => {
        screen.updateAlerts(alert);
    });
}, config.dashboard.checkAlertInterval);
