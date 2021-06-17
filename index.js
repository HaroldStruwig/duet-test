var fsp = require('fs').promises;
var path = require('path');
var getCrc32 = require('crc32');

var axios = require('axios');

const ip = '127.0.0.1'
const port = '8080'
const filesDir = path.join(__dirname, 'files');

uploadFileToController('cyrus_test.gcode')
    .then(() => {
        console.log('SUCCESS');
    })
    .catch((err) => {
        console.log('FAIL', err);
    });

async function uploadFileToController (filename) {
    const data = await fsp.readFile(path.join(filesDir, filename), {encoding: 'utf8'});
    const name = `0:/gcodes/${filename}`;
    const time = (new Date()).toISOString();
    const crc32 = getCrc32(data);
    const params = {
        name,
        time,
        crc32
    };
    await postFile('/rr_upload', params, data);
}

async function postFile(uriPath, params, data) {
    const url = `http://${ip}:${port}${uriPath}`;
    const method = 'post';
    const result = await axios({
        method,
        url,
        params,
        data
    });
    if (result.data.err !== 0) throw new Error('error from duet: ' + result.data.err);
    return result;
}

