module.exports = {
    fetch: {
        websites: {
            'https://www.datadoghq.com': 1000,
            'https://www.google.com': 1000,
        },
    },
    database: {
        host: 'localhost',
        port: 5432,
        database: 'uptime_monitor',
        user: 'postgres',
        password: 'password',
    },
    alerts: {
        timespan: 120000,
        checkInterval: 5000,
    },
    dashboard: {
        checkAlertInterval: 5000,
        checkStatsIntervals: {
            short: {
                period: 60000,
                checkInterval: 10000,
            },
            long: {
                period: 3600000,
                checkInterval: 60000,
            },
        },
        tableColumnsConfig: {
            0: {
                width: 10,
            },
            1: {
                width: 10,
            },
            2: {
                width: 10,
            },
            3: {
                width: 10,
            },
            4: {
                width: 10,
            },
            5: {
                width: 10,
            },
            6: {
                width: 10,
            },
        },
        widgetsConfig: {
            hostList: {
                label: '{white-fg}{bold}Hosts list{/bold}{/white-fg}',
                width: '25%',
                height: '40%',
                keys: true,
                mouse: true,
                tags: true,
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

            },
            alertBox: {
                label: '{white-fg}{bold}Alerts{/bold}{/white-fg}',
                content: '',
                left: '25%',
                width: '75%',
                height: '40%',
                tags: true,
                border: {
                    type: 'line',
                },
                style: {
                    fg: 'white',
                    bg: 'black',
                    bold: true,
                    border: {
                        fg: 'green',
                    },
                },
            },
            statsBox: {
                label: '{white-fg}{bold}Stats{/bold}{/white-fg}',
                top: '40%',
                height: '60%',
                tags: true,
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
            },
            short: {
                box: {
                    left: '1%',
                    width: '49%',
                    style: {
                        fg: 'white',
                        bg: 'black',
                        border: {
                            fg: 'green',
                        },
                    },
                },
                statsTitle: {
                    height: '10%',
                    top: '5%',
                    left: 'center',
                    style: {
                        fg: 'white',
                        bg: 'black',
                        bold: true,
                    },
                },
                availability: {
                    label: '{white-fg}{bold}Availability{/bold}{/white-fg}',
                    top: '10%',
                    height: '30%',
                    stroke: 'green',
                    fill: 'white',
                    tags: true,
                    border: {
                        type: 'line',
                    },
                    style: {
                        border: {
                            fg: 'green',
                        },
                    },
                },
                responseTimes: {
                    label: '{white-fg}{bold}Response times{/bold}{/white-fg}',
                    top: '40%',
                    height: '30%',
                    border: 'line',
                    tags: true,
                    padding: {
                        left: 3,
                    },
                    style: {
                        fg: 'white',
                        border: {
                            fg: 'green',
                        },
                    },
                },
                statusCodesCounts: {
                    label: '{white-fg}{bold}Status codes counts{/bold}{/white-fg}',
                    top: '70%',
                    height: '30%',
                    barWidth: 4,
                    barSpacing: 6,
                    maxHeight: 5,
                    barBgColor: 'blue',
                    border: 'line',
                    tags: true,
                    style: {
                        border: {
                            fg: 'gree',
                        },
                    },
                },
            },
            long: {
                box: {
                    left: '50%',
                    width: '49%',
                    style: {
                        fg: 'white',
                        bg: 'black',
                        border: {
                            fg: 'green',
                        },
                    },
                },
                statsTitle: {
                    height: '10%',
                    top: '5%',
                    left: 'center',
                    style: {
                        fg: 'white',
                        bg: 'black',
                        bold: true,
                    },
                },
                availability: {
                    label: '{white-fg}{bold}Availability{/bold}{/white-fg}',
                    top: '10%',
                    height: '30%',
                    stroke: 'green',
                    fill: 'white',
                    tags: true,
                    border: {
                        type: 'line',
                    },
                    style: {
                        border: {
                            fg: 'green',
                        },
                    },
                },
                responseTimes: {
                    label: '{white-fg}{bold}Response times{/bold}{/white-fg}',
                    top: '40%',
                    height: '30%',
                    border: 'line',
                    tags: true,
                    padding: {
                        left: 3,
                    },
                    style: {
                        fg: 'white',
                        border: {
                            fg: 'green',
                        },
                    },
                },
                statusCodesCounts: {
                    label: '{white-fg}{bold}Status codes counts{/bold}{/white-fg}',
                    top: '70%',
                    height: '30%',
                    barWidth: 4,
                    barSpacing: 6,
                    maxHeight: 5,
                    barBgColor: 'blue',
                    border: 'line',
                    tags: true,
                    style: {
                        border: {
                            fg: 'green',
                        },
                    },
                },
            },
        },
    },
};
