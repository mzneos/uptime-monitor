#!/usr/bin node
/* eslint-disable global-require */
/*
*   Handles the cli for the processes
*/

// Set the command line requirements and help messages
const { argv } = require('yargs')
    .usage('Usage: $0 <command>')
    .command('fetch', 'Start the process to fetch data from monitored websites')
    .command('process', 'Start the process that handles the alerting logic')
    .command('dashboard', 'Start the monitoring dashboard')
    .help('h')
    .alias('h', 'help')
    .demandCommand(1);

if (argv._.length !== 1) {
    console.log('Incorrect number of commands provided. See help for more details.');
    process.exit(0);
}

// Command check to start the correct file
if (argv._[0] === 'fetch') {
    require('../fetch/fetch.js');
} else if (argv._[0] === 'process') {
    require('../process/process.js');
} else if (argv._[0] === 'dashboard') {
    require('../dashboard/dashboard.js');
}
