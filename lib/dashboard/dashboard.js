const screen = require('./screen');
const dbQuery = require('./databaseQueries');
const config = require('../config/config');

screen.initScreen();

// Short period update
setInterval(async () => {
    screen.updatePeriodStats('short');
}, config.dashboard.checkStatsIntervals.short.checkInterval);

// Long period update
setInterval(async () => {
    screen.updatePeriodStats('long');
}, config.dashboard.checkStatsIntervals.long.checkInterval);

// Alerts history update
setInterval(async () => {
    const alerts = await dbQuery.getAlerts();

    alerts.forEach((alert) => {
        screen.updateAlerts(alert);
    });
}, config.dashboard.checkAlertInterval);
