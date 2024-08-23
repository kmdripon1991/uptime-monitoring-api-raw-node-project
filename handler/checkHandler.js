/*
 * Title: Check Handler
 * Description: Handle to handle Check related routes
 * Author: Md. Ripon Khan
 * Date: 16/08/2024
 * */

// Dependencies
const data = require('../lib/data');
const { parseJSON, createRandomString } = require('../helper/utilities');
const { maxChecks } = require('../helper/environments');
const tokenHandler = require('./tokenHandler');

// app Scaffolding
const handler = {};

handler.checkHandler = (requestProperties, callback) => {
    // console.log(requestProperties);
    const acceptedRoutes = ['get', 'post', 'put', 'delete'];
    if (acceptedRoutes.indexOf(requestProperties.method) > -1) {
        handler._users[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

handler._users = {};

handler._users.post = (requestProperties, callback) => {
    const protocol =
        typeof requestProperties.body.protocol === 'string' &&
        ['http', 'https'].indexOf(requestProperties.body.protocol) > -1
            ? requestProperties.body.protocol
            : false;

    const url =
        typeof requestProperties.body.url === 'string' &&
        requestProperties.body.url.trim().length > 0
            ? requestProperties.body.url
            : false;

    const method =
        typeof requestProperties.body.method === 'string' &&
        ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1
            ? requestProperties.body.method
            : false;

    const successCodes = typeof requestProperties.body.successCodes === 'object' &&
        requestProperties.body.successCodes instanceof Array
            ? requestProperties.body.successCodes
            : false;

    const timeoutSeconds = typeof requestProperties.body.timeoutSeconds === 'number' &&
        requestProperties.body.timeoutSeconds % 1 === 0 &&
        requestProperties.body.timeoutSeconds >= 1 &&
        requestProperties.body.timeoutSeconds <= 5
            ? requestProperties.body.timeoutSeconds
            : false;

    // console.log(protocol, url, method, successCodes, timeoutSeconds);

    if (protocol && url && method && successCodes && timeoutSeconds) {
        const token =            typeof requestProperties.headersObject.token === 'string'
                ? requestProperties.headersObject.token
                : false;
        data.read('tokens', token, (err1, tokenData) => {
            if (!err1 && tokenData) {
                const userPhone = parseJSON(tokenData).phone;
                data.read('users', userPhone, (err2, userData) => {
                    if (!err2 && userData) {
                        tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
                            if (tokenIsValid) {
                                const userDataObj = parseJSON(userData);
                                // console.log(userDataObj);
                                const userChecks =                                    typeof userDataObj.checks === 'object' &&
                                    userDataObj.checks instanceof Array
                                        ? userDataObj.checks
                                        : [];
                                        console.log(userChecks);

                                if (userChecks.length < maxChecks) {
                                    const checkId = createRandomString(20);
                                    const checkObject = {
                                        id: checkId,
                                        userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCodes,
                                        timeoutSeconds,
                                    };
                                    data.create('checks', checkId, checkObject, (err3) => {
                                        if (!err3) {
                                            // add checkId to the user's object
                                            userDataObj.checks = userChecks;
                                            userDataObj.checks.push(checkId);
                                            // update the user data object
                                            data.update('users', userPhone, userDataObj, (err4) => {
                                                if (!err4) {
                                                    // return the data new object
                                                    callback(200, checkObject);
                                                } else {
                                                    callback(500, {
                                                        error: 'There was a problem in server side',
                                                    });
                                                }
                                            });
                                        } else {
                                            callback(500, {
                                                error: 'There was a problem in server side',
                                            });
                                        }
                                    });
                                } else {
                                    callback(401, {
                                        error: 'User has already reached the max checked limits',
                                    });
                                }
                            } else {
                                callback(403, { error: 'Authentication problem' });
                            }
                        });
                    } else {
                        callback(403, { error: 'User not Found' });
                    }
                });
            } else {
                callback(403, { error: 'Authentication problem' });
            }
        });
    } else {
        callback(400, { error: 'There was a problem in your request' });
    }
};
handler._users.get = (requestProperties, callback) => {
    const id =
        typeof requestProperties.queryStringObject.id === 'string' &&
        requestProperties.queryStringObject.id.trim().length === 20
            ? requestProperties.queryStringObject.id
            : false;
    if (id) {
        data.read('checks', id, (err1, checkData) => {
            if (!err1 && checkData) {
                const checkDataObj = parseJSON(checkData);
                const token =
                    typeof requestProperties.headersObject.token === 'string'
                        ? requestProperties.headersObject.token
                        : false;
                tokenHandler._token.verify(token, checkDataObj.userPhone, (tokenIsValid) => {
                    if (tokenIsValid) {
                        callback(200, checkDataObj);
                    } else {
                        callback(403, { error: 'Authentication failure!' });
                    }
                });
            } else {
                callback(500, { error: 'There was a problem in server side!' });
            }
        });
    } else {
        callback(400, { error: 'You have a problem in your request' });
    }
};
handler._users.put = (requestProperties, callback) => {
    const id = 
        typeof requestProperties.queryStringObject.id === 'string' &&
        requestProperties.queryStringObject.id.trim().length === 20
            ? requestProperties.queryStringObject.id
            : false;

    const protocol = 
        typeof requestProperties.body.protocol === 'string' && 
        ['http', 'https'].indexOf(requestProperties.body.protocol) > -1
            ? requestProperties.body.protocol
            : false;
    const url = 
        typeof requestProperties.body.url === 'string' && 
        requestProperties.body.url.trim().length > 0
            ? requestProperties.body.url
            : false;
    const method = 
        typeof requestProperties.body.method === 'string' && 
        ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method).length > -1
            ? requestProperties.body.method
            : false;
    const successCodes = 
        typeof requestProperties.body.successCodes === 'object' && 
        requestProperties.body.successCodes instanceof Array
            ? requestProperties.body.successCodes
            : false;
    const timeoutSeconds = 
        typeof requestProperties.body.timeoutSeconds === 'number' && 
        requestProperties.body.timeoutSeconds % 1 === 0 &&
        requestProperties.body.timeoutSeconds >= 1 &&
        requestProperties.body.timeoutSeconds <= 5
            ? requestProperties.body.timeoutSeconds
            : false;

    if (id) {
        if (protocol || url || method || successCodes || timeoutSeconds) {
            data.read('checks', id, (err1, checkData) => {
                if (!err1 && checkData) {
                    const checkObject = parseJSON(checkData);
                    const token = 
                        typeof requestProperties.headersObject.token === 'string' &&
                        requestProperties.headersObject.token.trim().length === 20
                            ? requestProperties.headersObject.token
                            : false;
                    tokenHandler._token.verify(token, checkObject.userPhone, (tokenIsValid) => {
                        if (tokenIsValid) {
                            if (protocol) {
                                checkObject.protocol = protocol;
                            }
                            if (url) {
                                checkObject.url = url;
                            }
                            if (method) {
                                checkObject.method = method;
                            }
                            if (successCodes) {
                                checkObject.successCodes = successCodes;
                            }
                            if (timeoutSeconds) {
                                checkObject.timeoutSeconds = timeoutSeconds;
                            }
                            data.update('checks', id, checkObject, (err2) => {
                                if (!err2) {
                                    callback(200, checkObject);
                                } else {
                                    callback(500, { error: 'There was a problem in server side!' });
                                }
                            });
                        } else {
                            callback(403, { error: 'Authentication failure!' });
                        }
                    });
                } else {
                    callback(500, { error: 'There was a problem in server side!' });
                }
            });
        } else {
            callback(400, { error: 'You have a problem in your request2.' });
        }
    } else {
        callback(400, { error: 'You have a problem in your request1.' });
    }
};

handler._users.delete = (requestProperties, callback) => {
    const id = 
        typeof requestProperties.queryStringObject.id === 'string' &&
        requestProperties.queryStringObject.id.trim().length === 20
            ? requestProperties.queryStringObject.id
            : false;
    if (id) {
        data.read('checks', id, (err1, checkData)=>{
            if (!err1) {
                const checkObject = parseJSON(checkData);
                const token = 
                typeof requestProperties.headersObject.token === 'string' &&
                    requestProperties.headersObject.token.trim().length === 20
                        ? requestProperties.headersObject.token
                        : false;
                tokenHandler._token.verify(token, checkObject.userPhone, (tokenIsValid) => {
                    if (tokenIsValid) {
                        data.delete('checks', id, (err2)=>{
                            if (!err2) {
                                data.read('users', checkObject.userPhone, (err3, userData) => {
                                    const userObject = parseJSON(userData);
                                    if (!err3 && userData) {
                                        const userChecks = 
                                            typeof userObject.checks === 'object' &&
                                            userObject.checks instanceof Array
                                                ? userObject.checks
                                                : [];
                                        // remove the deleted check id
                                        const checkPosition = userChecks.indexOf(id);
                                        if (checkPosition > -1) {
                                            userChecks.splice(checkPosition, 1);
                                            // upadate the user's data
                                            data.update(
                                                'users',
                                                userObject.phone,
                                                userObject,
                                                (err4) => {
                                                    if (!err4) {
                                                        callback(200, userObject);
                                                    } else {
                                                        callback(500, {
                                                            error: 'There was a problem in server side',
                                                        });
                                                    }
                                                }
                                            );
                                        } else {
                                            callback(500, {
                                                error: 'The check id that you are trying to remove is not found in user!',
                                            });
                                        }
                                    } else {
                                        callback(500, {
                                            error: 'There was a problem in server side',
                                        });
                                    }
                                });
                            } else {
                                callback(500, { error: 'There was a problem in server side' });
                            }
                        });
                    } else {
                        callback(403, { error: 'Authentication failure!' });
                    }
                });
            } else {
                callback(500, { error: 'There was a problem in your server side.' });
            }
        });
    } else {
        callback(400, { error: 'You have a problem in your request' });
    }
};

module.exports = handler;
