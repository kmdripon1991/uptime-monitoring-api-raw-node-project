/*
 * Title: Sample Handler
 * Description: Sample Handler
 * Author: Md. Ripon Khan
 * Date: 03/08/2024
 * */

// app Scaffolding
const handler = {};
handler.sampleHandler = (requestProperties, callback) => {
    console.log(requestProperties);
    callback(200, {
        message: 'This is simple url',
    });
};

module.exports = handler;
