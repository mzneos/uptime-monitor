module.exports = {
    fetch: {
        monitoredUrl: 'https://www.datadoghq.com',
        intervalTime: 1000,
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
                width: 5,
            },
            1: {
                width: 5,
            },
            2: {
                width: 5,
            },
            3: {
                width: 5,
            },
            4: {
                width: 5,
            },
            6: {
                width: 5,
            },
        },
        widgetsConfig: {
            hostList: {
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
            },
            alertBox: {
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
            },
            statsBox: {
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
                    style: {
                        fg: 'white',
                        bg: 'black',
                    },
                },
                availability: {
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
                },
                responseTimes: {
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
                },
                statusCodesCounts: {
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
                },
            },
            longPeriodStats: {
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
            longStatsTitle: {
                height: '10%',
                style: {
                    fg: 'white',
                    bg: 'black',
                },
            },
        },
    },
};
