const log = require('simple-node-logger').createSimpleFileLogger(`${__dirname.substring(0, __dirname.lastIndexOf('/'))}`
    + '/log/process.log');

const config = require('../config/config');
const alerts = require('./alerts');

const setAlertProcessing = () => {
    // Add alert processing for each host, every config.alerts.checkInterval milliseconds
    Object.keys(config.fetch.websites).forEach((host) => {
        setInterval(() => {
            alerts.updateAlertHistory(host, config.alerts.timespan);
        }, config.alerts.checkInterval);
    });
};

// Wait for config.alerts.timespan before starting to process alerts
// Prevent triggering false alerts when starting the fetch and the process parts of the monitor
setTimeout(() => {
    log.info(`Start processing alerts : ${Date()}`);
    setAlertProcessing();
}, config.alerts.timespan);
