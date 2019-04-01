/*
*   Handles dashboard creation and widget update
*/

const blessed = require('blessed');
const contrib = require('blessed-contrib');
const table = require('table');
const moment = require('moment');
const humanizeDuration = require('humanize-duration');

const config = require('../config/config');
const getAvailability = require('../database/availability');
const dbQuery = require('./databaseQueries');

const screen = blessed.screen({
    smartCSR: true,
});

// Variable declaration outside initScreen for update purposes
const widgets = {
    hostList: undefined,
    alertBox: undefined,
    statsBox: undefined,
    shortPeriodStats: undefined,
    shortStatsTitle: undefined,
    shortAvailability: undefined,
    shortResponseTimes: undefined,
    shortStatusCodes: undefined,
    longPeriodStats: undefined,
    longStatsTitle: undefined,
};

let selectedHost;
const tableConfig = {
    columns: config.dashboard.tableColumnsConfig,
    border: table.getBorderCharacters('norc'),
};

const initScreen = async () => {
    // Initialization of the widgets
    widgets.hostList = blessed.list(config.dashboard.widgetsConfig.hostList);
    widgets.alertBox = blessed.box(config.dashboard.widgetsConfig.alertBox);
    widgets.statsBox = blessed.box(config.dashboard.widgetsConfig.statsBox);
    widgets.shortPeriodStats = blessed.box(config.dashboard.widgetsConfig.shortPeriodStats);
    widgets.shortStatsTitle = blessed.text(config.dashboard.widgetsConfig.shortStatsTitle);
    widgets.shortAvailability = contrib.gauge(config.dashboard.widgetsConfig.shortAvailability);
    widgets.shortResponseTimes = blessed.box(config.dashboard.widgetsConfig.shortResponseTimes);
    widgets.shortStatusCodes = contrib.bar(config.dashboard.widgetsConfig.shortStatusCodes);
    widgets.longPeriodStats = blessed.box(config.dashboard.widgetsConfig.longPeriodStats);
    widgets.longStatsTitle = blessed.text(config.dashboard.widgetsConfig.longStatsTitle);

    // Append widgets to screen
    screen.append(widgets.hostList);
    screen.append(widgets.alertBox);
    screen.append(widgets.statsBox);
    widgets.statsBox.append(widgets.shortPeriodStats);
    widgets.statsBox.append(widgets.longPeriodStats);
    widgets.shortPeriodStats.append(widgets.shortStatsTitle);
    widgets.shortPeriodStats.append(widgets.shortAvailability);
    widgets.shortPeriodStats.append(widgets.shortResponseTimes);
    widgets.shortPeriodStats.append(widgets.shortStatusCodes);
    widgets.longPeriodStats.append(widgets.longStatsTitle);

    // Set title for periodStatsTitle objects
    widgets.shortStatsTitle.setContent('Stats for '
        + `${humanizeDuration(config.dashboard.checkStatsIntervals.shortPeriod.period)}, `
        + `refreshed every ${humanizeDuration(config.dashboard.checkStatsIntervals.shortPeriod.checkInterval)}`);
    widgets.longStatsTitle.setContent('Stats for '
        + `${humanizeDuration(config.dashboard.checkStatsIntervals.longPeriod.period)}, `
        + `refreshed every ${humanizeDuration(config.dashboard.checkStatsIntervals.longPeriod.checkInterval)}`);

    // Add line to hostList
    widgets.hostList.addItem(config.fetch.monitoredUrl);

    // Initialize selectedHost
    selectedHost = widgets.hostList.getItem(widgets.hostList.selected).content;

    // Update selectedHost when select event is triggered
    widgets.hostList.on('select', () => {
        selectedHost = widgets.hostList.getItem(widgets.hostList.selected).content;
    });

    try {
        // Set availability gauges
        await updateShortAvailability();

        // Initialize response times
        await updateShortResponseTimes();

        // Initialize status codes counts
        await updateShortStatusCode();
    } catch (err) {
        console.log(err);
    }

    // Close screen on Esc, q or Ctrl+C
    screen.key(['escape', 'q', 'C-c'], () => process.exit(0));

    // Render screen
    screen.render();
};

// Update the alert widgets, displaying alerts for every host, since the dashboard was opened
const updateAlerts = async (alert) => {
    let string = '';

    if (alert.state === 'triggered') {
        string += `Website ${alert.host} is down.\tavailability = ${alert.availability}\t`
            + `time = ${moment(alert.time).format('MM-DD-YY HH:mm:ss')}`;
    } else {
        string += `Website ${alert.host} is up.\tavailability = ${alert.availability}\t`
            + `time = ${moment(alert.time).format('MM-DD-YY HH:mm:ss')}`;
    }

    widgets.alertBox.pushLine(string);
    screen.render();
};

// Update availability gauge
const updateShortAvailability = async () => {
    try {
        const shortAvailability = await getAvailability(selectedHost,
            config.dashboard.checkStatsIntervals.shortPeriod.period);

        widgets.shortAvailability.setPercent(shortAvailability * 100);

        screen.render();
    } catch (err) {
        console.log(`Unable to get short period availability for host ${selectedHost}`);
        console.log(err);
    }
};

// Update the response times table
const updateShortResponseTimes = async () => {
    try {
        const result = await dbQuery.getResponseTimes(selectedHost, config.dashboard.checkStatsIntervals.shortPeriod.period);

        if (result !== undefined) {
            widgets.shortResponseTimes.setContent('');
            screen.render();

            widgets.shortResponseTimes.content = table.table([
                ['', 'DNS', 'TCP', 'TLS', 'TTFB', 'Transfer', 'Total'],
                ['Avg', `${Math.floor(result.avg_dns)}ms`, `${Math.floor(result.avg_tcp)}ms`,
                    `${Math.floor(result.avg_tls)}ms`, `${Math.floor(result.avg_ttfb)}ms`,
                    `${Math.floor(result.avg_transfer)}ms`, `${Math.floor(result.avg_total)}ms`],
                ['Max', `${Math.floor(result.max_dns)}ms`, `${Math.floor(result.max_tcp)}ms`,
                    `${Math.floor(result.max_tls)}ms`, `${Math.floor(result.max_ttfb)}ms`,
                    `${Math.floor(result.max_transfer)}ms`, `${Math.floor(result.max_total)}ms`]], tableConfig);

            screen.render();
        }
    } catch (err) {
        console.log(err);
    }
};

// Update the status code count bars
const updateShortStatusCode = async () => {
    try {
        const statusCodeCounts = await dbQuery.getStatusCodeCounts(selectedHost,
            config.dashboard.checkStatsIntervals.shortPeriod.period);

        // Compute number of status code other than 200 and 502
        const countOther = (config.dashboard.checkStatsIntervals.shortPeriod.period / config.fetch.intervalTime)
        - statusCodeCounts.count_200 - statusCodeCounts.count_502;

        widgets.shortStatusCodes.setData({
            titles: ['200', '502', 'other'],
            data: [statusCodeCounts.count_200, statusCodeCounts.count_502, countOther],
        });
    } catch (err) {
        console.log(`Unable to get short period status code counts for host ${selectedHost}`);
        console.log(err);
    }
};

module.exports = {
    initScreen,
    updateAlerts,
    updateShortAvailability,
    updateShortResponseTimes,
    updateShortStatusCode,
};
