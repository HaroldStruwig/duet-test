const PrintManager = require('./print-manager');

const printManager = new PrintManager({
    ipAddress: '192.168.68.123',
    patterns: [
        'cyrus_test.gcode',
        'cyrus_test_2.gcode'
    ],
    cleanPatterns: [
        'clean_pattern_1.gcode',
        'clean_pattern_2.gcode'
    ]
});

printManager.startPrintSequence()

// const response = printManager.sendCommand('M27')
//     .then(response => {
//         console.log('response', response);
//     })
//     .catch(err => {
//         console.error(err);
//     })
