/*
*   Handles dashboard creation and widget update
*/

const blessed = require('blessed');

const screen = blessed.screen({
    smartCSR: true,
});

const initScreen = () => {
    // Initialization of the widgets
    const hostBox = blessed.box({
        label: 'Hosts',
        content: 'No host configured',
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
        },
    });

    const alertBox = blessed.box({
        label: 'Alerts',
        content: 'No data available',
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

    const statsBox = blessed.box({
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
    screen.append(hostBox);
    screen.append(alertBox);
    screen.append(statsBox);

    // Close screen on Esc, q or Ctrl+C
    screen.key(['escape', 'q', 'C-c'], (ch, key) => process.exit(0));

    // Render screen
    screen.render();
};

module.exports = {
    initScreen,
};
