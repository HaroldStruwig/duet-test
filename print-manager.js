const axios = require('axios');
const _ = require('lodash');
var util = require('util');
const sleep = util.promisify(setTimeout);

module.exports = class PrintManager {
    constructor(options) {
        this.options = options;
    }

    async sendCommand(command) {
        const response = await axios.get('http://' + this.options.ipAddress + '/rr_gcode?gcode=' + command);

        if (response.status >= 200 && response.status < 300) {
            await sleep(200);
            const rrResponse = await axios.get('http://' + this.options.ipAddress + '/rr_reply');
            if (rrResponse.status >= 200 && rrResponse.status < 300) {
                return rrResponse.data.toString();
            } else {
                throw Error('Bad rr response from printer');
            }

        } else {
            throw Error('Bad response from printer');
        }
    }

    async startPrintSequence() {
        const patterns = this.options.patterns;
        const cleanPatterns = this.options.cleanPatterns;
        let cleanPatternCount = this.options.cleanPatterns.length - 1;
        let printMessage = '';

        for (let i = 0; i < patterns.length; i++) {
            try {
                printMessage = `Starting print for ${patterns[i]}`;
                await this.sendPanelMessage(printMessage);
                console.log(printMessage);
                await this.printFile(patterns[i]);

                printMessage = 'Clearing pattern...';
                await this.sendPanelMessage(printMessage);

                await this.printFile(cleanPatterns[cleanPatternCount--]);

                if (cleanPatternCount === 0) {
                    cleanPatternCount = this.options.cleanPatterns.length - 1;
                }

            } catch (err) {
                console.error('print failure', err);
            }

        }
    }

    /**
     * Prints a file and waits for print completion
     * @param file
     * @returns {Promise<void>}
     */
    async printFile(file) {
        await this.sendCommand('M23 ' + file);
        await this.sendCommand('M24');
        let printBusy = true;

        while (printBusy) {
            const response = await this.sendCommand('M27');

            if (response && response.indexOf('Not SD printing') > -1) {
                printBusy = false;
                break;
            } else if (response && response.indexOf('SD printing byte') > -1) {
                console.log(response)
            } else {
                console.log('Unknown print status response', response);
            }

            await sleep(20000);
        }
    }

    async pausePrint(file) {
        return this.sendCommand('M25');
    }

    /**
     * Sends information messages to the LCD panel
     * @param file
     * @returns {Promise<void>}
     */
    async sendPanelMessage(message) {
        return this.sendCommand(`M291 P"${message}" T8`);
    }

    stopPrintSequence() {

    }

    emergencyStop() {

    }

};
