/*
 * Title:Uptime Monitoring Application
 * Description: A RESTFul API to monitor up or down time user defined links
 * Author: Md. Ripon Khan
 * Date: 20/08/24
 * */

// Dependecies
const server = require('./lib/server');
const workers = require('./lib/worker');

// app - object module scaffolding
const app = {};

// configuration
app.config = {
    port: 3000,
};

// create server
app.init = () => {
    // start the server
    server.init();

    // start the workers
    workers.init();
};
// handle Request Response
app.init();

// export
module.exports = app;
