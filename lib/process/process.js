const config = require('../config/config');
const updateAlertHistory = require('./alerts');

setInterval(() => {
    updateAlertHistory(config.fetch.monitoredUrl, config.alerts.timespan);
}, config.alerts.checkInterval);
