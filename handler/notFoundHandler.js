/*
 * Title: Not Found Handler
 * Description: Not Found Handler
 * Author: Md. Ripon Khan
 * Date: 04/08/2024
 * */

// app Scaffolding
const handler = {};
handler.notFoundHandler = (requestProperties, callback) => {
    callback(404, { message: 'Your request URL not found' });
};

module.exports = handler;
