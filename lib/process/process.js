const config = require('../config/config');
const alerts = require('./alerts');

const initStates = async () => {
    Object.keys(config.fetch.websites).forEach(async (host) => {
        await alerts.initAlertState(host);
    });
};

initStates();

// Add alert processing for each host, every config.alerts.checkInterval milliseconds
Object.keys(config.fetch.websites).forEach((host) => {
    setInterval(() => {
        alerts.updateAlertHistory(host, config.alerts.timespan);
    }, config.alerts.checkInterval);
});
