/*
 * Title:Server library
 * Description: Server related files
 * Author: Md. Ripon Khan
 * Date: 20/08/24
 * */

// Dependecies
const http = require('http');
const { handleReqRes } = require('../helper/handleReqRes');

// app - object module scaffolding
const server = {};

// configuration
server.config = {
    port: 3000,
};

// create server
server.createServer = () => {
    const createServerVariable = http.createServer(server.handleReqRes);
    createServerVariable.listen(server.config.port, () => {
        console.log(`server listen on port ${server.config.port}`);
    });
};
// handle Request Response
server.handleReqRes = handleReqRes;

// start the server
server.init = () => {
    server.createServer();
};

// export the server
module.exports = server;
