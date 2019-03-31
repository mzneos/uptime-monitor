/*
*   Handles dashboard creation and widget update
*/

const blessed = require('blessed');
const contrib = require('blessed-contrib');
const moment = require('moment');
const humanizeDuration = require('humanize-duration');

const config = require('../config/config');
const getAvailability = require('../database/availability');

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
        height: '5%',
        style: {
            fg: 'white',
            bg: 'black',
        },
    });

    widgets.shortAvailability = contrib.gauge({
        label: 'Availability',
        top: '5%',
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

module.exports = {
    initScreen,
    updateAlerts,
    updateShortAvailability,
};
