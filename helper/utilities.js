/*
 * Title: Utilities
 * Description: Handle utility related function
 * Author: Md. Ripon Khan
 * Date: 11/08/2024
 * */

// Dependencies
const crypto = require('crypto');
const environments = require('./environments');

// module scaffolding
const utilities = {};

// parse json string to object
utilities.parseJSON = (jsonString) => {
    let output;
    try {
        output = JSON.parse(jsonString);
    } catch {
        output = {};
    }
    return output;
};

// hash string
utilities.hash = (str) => {
    if (typeof str === 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256', environments.secretKey).update(str).digest('hex');
        return hash;
    }
    return false;
};
// random string
utilities.createRandomString = (strLength) => {
    let length = strLength;
    length = typeof strLength === 'number' && strLength > 0 ? strLength : false;
    const characters = 'abcdefghijklmnopqrstuvwxyz1234567890';
    let result = '';
    if (length) {
        for (let i = 1; i <= length; i += 1) {
            const randomCharacter = characters.charAt(
                // eslint-disable-next-line comma-dangle
                Math.floor(Math.random() * characters.length)
            );
            result += randomCharacter;
        }
        return result;
    }
    return false;
};

// Export module
module.exports = utilities;
