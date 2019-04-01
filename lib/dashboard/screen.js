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
    longPeriodStats: undefined,
    shortStatsTitle: undefined,
    shortAvailability: undefined,
    shortResponseTimes: undefined,
    shortStatusCodes: undefined,
};

let selectedHost;
const tableConfig = {
    columns: config.dashboard.tableColumnsConfig,
    border: table.getBorderCharacters('norc'),
};

const initScreen = async () => {
    // Initialization of the widgets
    widgets.hostList = blessed.list({
        label: 'Hosts list',
        width: '25%',
        height: '40%',
        border: {
            type: 'line',
        },
        style: {
            fg: 'white',
            bg: 'black',
            border: {
                fg: 'green',
            },
            selected: {
                fg: 'black',
                bg: 'white',
            },
            item: {
                fg: 'white',
                bg: 'black',
            },
        },
        keys: true,
        mouse: true,
    });

    widgets.alertBox = blessed.box({
        label: 'Alerts',
        content: '',
        left: '25%',
        width: '75%',
        height: '40%',
        border: {
            type: 'line',
        },
        style: {
            fg: 'white',
            bg: 'black',
            border: {
                fg: 'green',
            },
        },
    });

    widgets.statsBox = blessed.box({
        label: 'Stats',
        top: '40%',
        height: '60%',
        border: {
            type: 'line',
        },
        style: {
            fg: 'white',
            bg: 'black',
            border: {
                fg: 'green',
            },
        },
    });

    widgets.shortPeriodStats = blessed.box({
        left: '1%',
        width: '49%',
        style: {
            fg: 'white',
            bg: 'black',
            border: {
                fg: 'green',
            },
        },
    });

    widgets.shortStatsTitle = blessed.text({
        content: `Stats for ${humanizeDuration(config.dashboard.checkStatsIntervals.shortPeriod.period)}, refreshed `
        + `every ${humanizeDuration(config.dashboard.checkStatsIntervals.shortPeriod.checkInterval)}`,
        height: '10%',
        style: {
            fg: 'white',
            bg: 'black',
        },
    });

    widgets.shortAvailability = contrib.gauge({
        label: 'Availability',
        top: '10%',
        height: '30%',
        stroke: 'green',
        fill: 'white',
        border: {
            type: 'line',
        },
        style: {
            border: {
                fg: 'green',
            },
        },
    });

    widgets.shortResponseTimes = blessed.box({
        label: 'Response times',
        top: '40%',
        height: '30%',
        border: 'line',
        padding: {
            left: 3,
        },
        style: {
            fg: 'white',
            border: {
                fg: 'green',
            },
        },
    });

    widgets.shortStatusCodes = contrib.bar({
        label: 'Status codes counts',
        top: '70%',
        height: '30%',
        barWidth: 4,
        barSpacing: 6,
        maxHeight: 5,
        barBgColor: 'blue',
        border: 'line',
        style: {
            border: {
                fg: 'gree',
            },
        },
    });

    widgets.longPeriodStats = blessed.box({
        label: `{white-fg}Stats for ${humanizeDuration(config.dashboard.checkStatsIntervals.longPeriod.period)}, refreshed `
            + `every ${humanizeDuration(config.dashboard.checkStatsIntervals.longPeriod.checkInterval)}{/white-fg}`,
        left: '50%',
        width: '49%',
        style: {
            fg: 'white',
            bg: 'black',
            border: {
                fg: 'green',
            },
        },
        tags: true,
    });

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

    // Add line to hostList
    widgets.hostList.addItem(config.fetch.monitoredUrl);

    // Initialize selectedHost
    selectedHost = widgets.hostList.getItem(widgets.hostList.selected).content;

    // Update selectedHost when select event is triggered
    widgets.hostList.on('select', () => {
        selectedHost = widgets.hostList.getItem(widgets.hostList.selected).content;
    });

    // Set availability gauges
    try {
        const shortAvailability = await getAvailability(selectedHost,
            config.dashboard.checkStatsIntervals.shortPeriod.period);

        widgets.shortAvailability.setPercent(shortAvailability * 100);
    } catch (err) {
        console.log(`Unable to get short period availability for host ${selectedHost}`);
        console.log(err);
    }

    // Add content to responseTimes objects
    widgets.shortResponseTimes.content = table.table([
        ['', 'DNS', 'TCP', 'TLS', 'TTFB', 'Transfer', 'Total'],
        ['Avg', '-', '-', '-', '-', '-', '-'],
        ['Max', '-', '-', '-', '-', '-', '-']], tableConfig);

    // Initialize status codes counts
    try {
        await updateShortStatusCode();
    } catch (err) {
        console.log(`Unable to get short period status code counts for host ${selectedHost}`);
        console.log(err);
    }

    // Close screen on Esc, q or Ctrl+C
    screen.key(['escape', 'q', 'C-c'], () => process.exit(0));

    // Render screen
    screen.render();
};

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
