/*
 *Title: Routes
 * Description: Handle Routes
 * Author: Md. Ripon kHan
 * Date: 03/08/2024
 * */

// Dependencies
const { sampleHandler } = require('./handler/sampleHandler');
const { userHandler } = require('./handler/userHandler');
const { tokenHandler } = require('./handler/tokenHandler');
const { checkHandler } = require('./handler/checkHandler');

const routes = {
    sample: sampleHandler,
    user: userHandler,
    token: tokenHandler,
    check: checkHandler,
};

module.exports = routes;
