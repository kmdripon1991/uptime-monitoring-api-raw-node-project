/*
 * Title: Notifications Library
 * Description: Important for functions to notify users
 * Author: Md. Ripon Khan
 * Date: 17/08/2024
 * */

// Dependencies
const https = require('https');
const queryString = require('querystring');
const { hostname } = require('os');
const path = require('path');
const { twilio } = require('./environments');

// console.log(twilio);

// app scaffolding
const notifications = {};

// send sms to users to using twilio api
notifications.sendTwilioSms = (phone, msg, callback) => {
    const userPhone =        typeof phone === 'string' && phone.trim().length === 11 ? phone.trim() : false;
    const userMsg =        typeof msg === 'string' && msg.trim().length > 0 && msg.trim().length <= 1600
            ? msg.trim()
            : false;
    if (userPhone && userMsg) {
        // configure the request payload
        const payload = {
            From: twilio.fromPhone,
            To: `+88${userPhone}`,
            Body: userMsg,
        };

        // stringify the payload object
        const stringifyPayload = queryString.stringify(payload);

        // configure the request details
        const requestDetails = {
            hostname: 'api.twilio.com',
            path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
            auth: `${twilio.accountSid}:${twilio.authToken}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringifyPayload),
            },
        };
        // instantiate the request object

        const req = https.request(requestDetails, (res) => {
            const status = res.statusCode;
            // callback successfully if the request went through
            if (status === 200 || status === 201) {
                callback(false);
            } else {
                callback(`status code returned was ${status}`);
            }
            req.setTimeout(30000); // Set timeout to 30 seconds

            req.on('timeout', () => {
                req.destroy(); // Abort the request if it takes too long
                callback('Request timed out');
            });
            req.on('error', (e) => {
                callback(e);
            });
            req.write(stringifyPayload);
            req.end();
        });
    } else {
        callback('Given parameter is missing or invalid');
    }
};

// module exports
module.exports = notifications;
