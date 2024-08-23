/*
 * Title:Worker library
 * Description: Worker related files
 * Author: Md. Ripon Khan
 * Date: 20/08/24
 * */

// Dependecies
const url = require('url');
const http = require('http');
const https = require('https');
const data = require('./data');
const { parseJSON } = require('../helper/utilities');
const { sendTwilioSms } = require('../helper/notification');

// worker - object module scaffolding
const worker = {};

// perform check
worker.performCheck = (originalCheckData) =>{
    // prepare the initial check outcome
    let checkOutcome = {
        error: false,
        responseCode: false,
    };

    // mark the outcome has not been yet sent
    let outcomeSent = false;

    // parse the hostname & full url from original data
    const parseUrl = url.parse(`${originalCheckData.protocol}://${originalCheckData.url}`, true);
    const hostName = parseUrl.hostname;
    const { path } = parseUrl;

    // construct the request
    const requestDetails = {
        protocol: `${originalCheckData.protocol}:`,
        hostname: hostName,
        method: originalCheckData.method.toUpperCase,
        path,
        timeout: originalCheckData.timeoutSeconds * 1000,
    };
    const protocolToUse =
        originalCheckData.protocol === 'http' ? originalCheckData.protocol : 'https';

    const req = protocolToUse.request(requestDetails, (res) => {
        // grab the status of the response
        const status = res.statusCode;

        // update the check outcome and pass to the next outcome
        checkOutcome.responseCode = status;
        if (!outcomeSent) {
            worker.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        }
    });

    req.on('error', (e) => {
        checkOutcome = {
            error: true,
            value: e,
        };
        // update the check outcome and pass to the next outcome
        if (!outcomeSent) {
            worker.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        }
    });

    req.on('timeOut', () => {
        checkOutcome = {
            error: true,
            value: 'timeout',
        };
        // update the check outcome and pass to the next outcome
        if (!outcomeSent) {
            worker.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        }
    });

    // send request
    req.end();
};

worker.processCheckOutcome = (originalCheckData, checkOutcome) => {
    const state =
        !checkOutcome.error &&
        checkOutcome.responseCode &&
        originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1
            ? 'up'
            : 'down';

    // decide whether we should alert the user or not
    const alertWanted = !!(originalCheckData.lastChecked && originalCheckData.state !== state);

    // update the check data
    const newCheckData = originalCheckData;
    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

    // update the check to disk
    data.update('checks', newCheckData.id, newCheckData, (err3) => {
        if (!err3) {
            if (!alertWanted) {
                // send the check data to the next process
                worker.alertUserToStatusChange(newCheckData);
            } else {
                console.log('Alert is not needed as there is no state change');
            }
        } else {
            console.log('Error trying to save check data one of the check')
        }
    });
};

// send notification sms to user if status  change
worker.alertUserToStatusChange = (newCheckData) =>{
    const alertMsg = `Alert: Your Check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}`;
    sendTwilioSms(newCheckData.userPhone, alertMsg, (err4) => {
        if (!err4) {
            console.log(`User was alerted to a status send sms via SMS : ${alertMsg}`);
        } else {
            console.log('There was a problem sending sms to one of the user phone');
        }
    });
};

// validate individual check data
worker.checkValidator = (originalCheckData) => {
    if (originalCheckData && originalCheckData.id) {
        const originalData = originalCheckData;
        originalData.state =
            typeof originalCheckData.state === 'string' &&
            ['up', 'down'].indexOf(originalCheckData.state) > -1
                ? originalCheckData.state
                : 'down';

        originalData.lastChecked =
            typeof originalCheckData.lastChecked === 'number' && originalCheckData.lastChecked > 0
                ? originalCheckData.lastChecked
                : false;

        // pass the next process
        worker.performCheck(originalData);
    } else {
        console.log('Error: Check was invalid or not properly formatted');
    }
};

// look up All Checks
worker.gatherAllChecks = () => {
    // get all the checks
    data.list('checks', (err1, checks) => {
        if (!err1 && checks && checks > 0) {
            checks.array.forEach((check) => {
                // read the check data
                data.read('checks', check, (err2, originalCheckData) => {
                    if (!err2 && originalCheckData) {
                        // pass the data to the check validator
                        worker.checkValidator(parseJSON(originalCheckData));
                    } else {
                        console.log('Error: reading one of the check data');
                    }
                });
            });
        } else {
            console.log('could not find any checks to process');
        }
    });
};

// timer to execute the worker process per minute
worker.loop = () => {
    setInterval(() => {
        worker.gatherAllChecks();
    }, 1000 * 60);
};

// start the worker
worker.init = () => {
    worker.loop();
};

// export the server
module.exports = worker;
