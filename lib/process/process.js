const config = require('../config/config');
const alerts = require('./alerts');

const initStates = async () => {
    await alerts.initAlertState(config.fetch.monitoredUrl);
};

initStates();

setInterval(() => {
    alerts.updateAlertHistory(config.fetch.monitoredUrl, config.alerts.timespan);
}, config.alerts.checkInterval);
