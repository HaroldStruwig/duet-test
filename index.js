var fsp = require('fs').promises;
var path = require('path');

var axios = require('axios');

const ip = '127.0.0.1'
const port = '8080'
const filepath = path.join(__dirname, 'files', 'cyrus_test.gcode');

let filedata;

run()
    .then(() => {
        console.log('SUCCESS');
    })
    .catch((err) => {
        console.log('FAIL', err);
    });

async function run () {
    filedata = await fsp.readFile(filepath, {encoding: 'utf8'});
    // todo - compose uri params instead of hardcoding
    const path = '/rr_upload?name=0%3A%2Fgcodes%2Fcyrus_test.gcode&time=2021-6-16T12%3A23%3A7&crc32=7f0d5568';
    await postFile(filedata, path);
}

async function postFile(filedata, path) {
    const url = `http://${ip}:${port}${path}`;
    const result = await axios.post(url, filedata);
    if (result.data.err !== 0) throw new Error('error from duet: ' + result.data.err);
    return result;
}

