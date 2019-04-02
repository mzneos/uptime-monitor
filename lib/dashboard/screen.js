/* eslint-disable no-use-before-define */
/*
*   Handles dashboard creation and widget update
*/

const blessed = require('blessed');
const contrib = require('blessed-contrib');
const table = require('table');
const moment = require('moment');
const humanizeDuration = require('humanize-duration');
const log = require('simple-node-logger').createSimpleFileLogger(`${__dirname.substring(0, __dirname.lastIndexOf('/'))}`
    + '/log/dashboard.log');

const config = require('../config/config');
const getAvailability = require('../util/availability');
const dbQuery = require('./databaseQueries');

const screen = blessed.screen({
    smartCSR: true,
});

// Variable declaration outside initScreen for update purposes
const widgets = {
    hostList: undefined,
    alertBox: undefined,
    statsBox: undefined,
    short: {
        box: undefined,
        statsTitle: undefined,
        availability: undefined,
        responseTimes: undefined,
        statusCodesCount: undefined,
    },
    long: {
        box: undefined,
        statsTitle: undefined,
        availability: undefined,
        responseTimes: undefined,
        statusCodesCount: undefined,
    },
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
    widgets.short.box = blessed.box(config.dashboard.widgetsConfig.short.box);
    widgets.short.statsTitle = blessed.text(config.dashboard.widgetsConfig.short.statsTitle);
    widgets.short.availability = contrib.gauge(config.dashboard.widgetsConfig.short.availability);
    widgets.short.responseTimes = blessed.box(config.dashboard.widgetsConfig.short.responseTimes);
    widgets.short.statusCodesCounts = contrib.bar(config.dashboard.widgetsConfig.short.statusCodesCounts);
    widgets.long.box = blessed.box(config.dashboard.widgetsConfig.long.box);
    widgets.long.statsTitle = blessed.text(config.dashboard.widgetsConfig.long.statsTitle);
    widgets.long.availability = contrib.gauge(config.dashboard.widgetsConfig.long.availability);
    widgets.long.responseTimes = blessed.box(config.dashboard.widgetsConfig.long.responseTimes);
    widgets.long.statusCodesCounts = contrib.bar(config.dashboard.widgetsConfig.long.statusCodesCounts);

    // Append widgets to screen
    screen.append(widgets.hostList);
    screen.append(widgets.alertBox);
    screen.append(widgets.statsBox);
    widgets.statsBox.append(widgets.short.box);
    widgets.statsBox.append(widgets.long.box);
    widgets.short.box.append(widgets.short.statsTitle);
    widgets.short.box.append(widgets.short.availability);
    widgets.short.box.append(widgets.short.responseTimes);
    widgets.short.box.append(widgets.short.statusCodesCounts);
    widgets.long.box.append(widgets.long.statsTitle);
    widgets.long.box.append(widgets.long.availability);
    widgets.long.box.append(widgets.long.responseTimes);
    widgets.long.box.append(widgets.long.statusCodesCounts);

    // Set title for periodStatsTitle objects
    widgets.short.statsTitle.setContent('Stats for '
        + `${humanizeDuration(config.dashboard.checkStatsIntervals.short.period)}, `
        + `refreshed every ${humanizeDuration(config.dashboard.checkStatsIntervals.short.checkInterval)}`);
    widgets.long.statsTitle.setContent('Stats for '
        + `${humanizeDuration(config.dashboard.checkStatsIntervals.long.period)}, `
        + `refreshed every ${humanizeDuration(config.dashboard.checkStatsIntervals.long.checkInterval)}`);

    // Add each host to hostList
    Object.keys(config.fetch.websites).forEach((host) => {
        widgets.hostList.addItem(host);
    });

    // Initialize selectedHost
    selectedHost = widgets.hostList.getItem(widgets.hostList.selected).content;

    try {
        // Update dashboard
        // No need to wait for the end of the function as each part of the dashboard
        // is re-rendered in the update functions
        updateDashboardStats();
    } catch (err) {
        log.error(err);
    }

    /* Event Handling */
    // Update selectedHost when select event is triggered
    widgets.hostList.on('select', () => {
        selectedHost = widgets.hostList.getItem(widgets.hostList.selected).content;
        updateDashboardStats();
    });

    widgets.hostList.key(['up'], () => {
        widgets.hostList.move(0); // zero offset otherwise one line is skipped
        selectedHost = widgets.hostList.getItem(widgets.hostList.selected).content;
        updateDashboardStats();
    });

    widgets.hostList.key(['down'], () => {
        widgets.hostList.move(0); // zero offset otherwise one line is skipped
        selectedHost = widgets.hostList.getItem(widgets.hostList.selected).content;
        updateDashboardStats();
    });

    // Close screen on Esc, q or Ctrl+C
    screen.key(['escape', 'q', 'C-c'], () => process.exit(0));

    // Render screen
    screen.render();
};

// Update the alert widgets, displaying alerts for every host, since the dashboard was opened
const updateAlerts = async (alert) => {
    let string = '';

    if (alert.state === 'triggered') {
        string += `Website ${alert.host} is {red-fg}DOWN{/red-fg}.\tavailability = ${alert.availability}\t`
            + `time = ${moment(alert.time).format('MM-DD-YY HH:mm:ss')}`;
    } else {
        string += `Website ${alert.host} is {green-fg}UP{/green-fg}.\tavailability = ${alert.availability}\t`
            + `time = ${moment(alert.time).format('MM-DD-YY HH:mm:ss')}`;
    }

    widgets.alertBox.pushLine(string);
    screen.render();
};

// Update availability gauge
const updateAvailability = async (period) => {
    try {
        const availability = await getAvailability(selectedHost,
            config.dashboard.checkStatsIntervals[period].period);

        widgets[period].availability.setPercent(availability * 100);

        screen.render();
    } catch (err) {
        log.error(`Unable to get availability for host ${selectedHost}`);
        log.error(err);
    }
};

// Update the response times table
const updateResponseTimes = async (period) => {
    try {
        const result = await dbQuery.getResponseTimes(selectedHost, config.dashboard.checkStatsIntervals[period].period);

        if (result !== undefined) {
            widgets[period].responseTimes.content = table.table([
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
        log.error(err);
    }
};

// Update the status code count bars
const updateStatusCode = async (period) => {
    try {
        const statusCodeCounts = await dbQuery.getStatusCodeCounts(selectedHost,
            config.dashboard.checkStatsIntervals[period].period);

        // Compute number of status code other than 200 and 502
        const countOther = (config.dashboard.checkStatsIntervals[period].period / config.fetch.websites[selectedHost])
        - statusCodeCounts.count_200 - statusCodeCounts.count_502;

        widgets[period].statusCodesCounts.setData({
            titles: ['200', '502', 'other'],
            data: [statusCodeCounts.count_200, statusCodeCounts.count_502, countOther],
        });

        screen.render();
    } catch (err) {
        log.error(`Unable to get short period status code counts for host ${selectedHost}`);
        log.error(err);
    }
};

const updatePeriodStats = async (period) => {
    try {
        // Update availability gauges, response times and status codes counts
        updateAvailability(period);
        updateResponseTimes(period);
        updateStatusCode(period);
    } catch (err) {
        log.error(err);
    }
};

// Update the statistics parts of the dashboard, for each period
const updateDashboardStats = async () => {
    try {
        updatePeriodStats('short');
        updatePeriodStats('long');
    } catch (err) {
        log.error(err);
    }
};

module.exports = {
    initScreen,
    updateAlerts,
    updatePeriodStats,
};
