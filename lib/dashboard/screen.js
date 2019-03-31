/*
*   Handles dashboard creation and widget update
*/

const blessed = require('blessed');
const moment = require('moment');

const config = require('../config/config');

const screen = blessed.screen({
    smartCSR: true,
});

let hostList;
let alertBox;
let statsBox;

const initScreen = () => {
    // Initialization of the widgets
    hostList = blessed.list({
        label: 'Hosts list',
        width: '25%',
        height: '50%',
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

    alertBox = blessed.box({
        label: 'Alerts',
        content: '',
        left: '25%',
        width: '75%',
        height: '50%',
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

    statsBox = blessed.box({
        label: 'Stats',
        content: 'No data available',
        top: '50%',
        height: '50%',
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

    // Append widgets to screen
    screen.append(hostList);
    screen.append(alertBox);
    screen.append(statsBox);

    // Add line to hostList
    hostList.addItem(config.fetch.monitoredUrl);

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

    alertBox.pushLine(string);
    screen.render();
};

module.exports = {
    initScreen,
    updateAlerts,
};
