/*
 * Title: User Handler
 * Description: Handle to handle user related routes
 * Author: Md. Ripon Khan
 * Date: 11/08/2024
 * */

// Dependencies
const data = require('../lib/data');
const { hash } = require('../helper/utilities');
const { parseJSON } = require('../helper/utilities');
const tokenHandler = require('./tokenHandler');

// app Scaffolding
const handler = {};

handler.userHandler = (requestProperties, callback) => {
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
    const firstName =        typeof requestProperties.body.firstName === 'string' &&
        requestProperties.body.firstName.trim().length > 0
            ? requestProperties.body.firstName
            : false;
    const lastName =        typeof requestProperties.body.lastName === 'string' &&
        requestProperties.body.lastName.trim().length > 0
            ? requestProperties.body.lastName
            : false;
    const phone =        typeof requestProperties.body.phone === 'string' &&
        requestProperties.body.phone.trim().length === 11
            ? requestProperties.body.phone
            : false;
    const password =        typeof requestProperties.body.password === 'string' &&
        requestProperties.body.password.trim().length > 0
            ? requestProperties.body.password
            : false;
    const tosAgreement =        typeof requestProperties.body.tosAgreement === 'boolean' &&
        requestProperties.body.tosAgreement
            ? requestProperties.body.tosAgreement
            : false;
    console.log(firstName, lastName, password, phone, tosAgreement);
    if (firstName && lastName && phone && password && tosAgreement) {
        // make sure that data was not exists
        data.read('users', phone, (readError) => {
            if (readError) {
                const userObject = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    tosAgreement,
                };
                data.create('users', phone, userObject, (createError) => {
                    if (!createError) {
                        callback(200, { message: 'User created successfully' });
                    }
                });
            } else {
                callback(500, { error: 'User is already exists' });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request',
        });
    }
};
handler._users.get = (requestProperties, callback) => {
    const phone =        typeof requestProperties.queryStringObject.phone === 'string' &&
        requestProperties.queryStringObject.phone.trim().length === 11
            ? requestProperties.queryStringObject.phone
            : false;
    if (phone) {
        // token verify
        const token =
            typeof requestProperties.headersObject.token === 'string'
                ? requestProperties.headersObject.token
                : false;

        tokenHandler._token.verify(token, phone, (tokenId) => {
            if (tokenId) {
                // look up the user
                data.read('users', phone, (readError, readUser) => {
                    const user = { ...parseJSON(readUser) };
                    if (!readError && user) {
                        delete user.password;
                        callback(200, user);
                    } else {
                        callback(404, { error: 'Requested user not found' });
                    }
                });
            } else {
                callback(403, { error: 'User Authentication failed' });
            }
        });
    } else {
        callback(404, { error: 'Requested user not found' });
    }
};
handler._users.put = (requestProperties, callback) => {
    const firstName =        typeof requestProperties.body.firstName === 'string' &&
        requestProperties.body.firstName.trim().length > 0
            ? requestProperties.body.firstName
            : false;

    const lastName =        typeof requestProperties.body.lastName === 'string' &&
        requestProperties.body.lastName.trim().length > 0
            ? requestProperties.body.lastName
            : false;

    const password =        typeof requestProperties.body.password === 'string' &&
        requestProperties.body.password.trim().length > 0
            ? requestProperties.body.password
            : false;

    const phone =        typeof requestProperties.body.phone === 'string' &&
        requestProperties.body.phone.trim().length === 11
            ? requestProperties.body.phone
            : false;
    // console.log(phone);

    if (phone) {
        if (firstName || lastName || password) {
            // verify token
            const token =                typeof requestProperties.headersObject.token === 'string'
                    ? requestProperties.headersObject.token
                    : false;

            tokenHandler._token.verify(token, phone, (tokenId) => {
                if (tokenId) {
                    // look up the user
                    data.read('users', phone, (readError, userData) => {
                        if (!readError && userData) {
                            const user = { ...parseJSON(userData) };
                            if (firstName) {
                                user.firstName = firstName;
                            }
                            if (lastName) {
                                user.lastName = lastName;
                            }
                            if (password) {
                                user.password = password;
                            }

                            // store data to database
                            data.update('users', phone, user, (errorUpdate) => {
                                if (!errorUpdate) {
                                    callback(200, { message: 'User updated successfully' });
                                }
                            });
                        } else {
                            callback(500, { error: 'There was a problem in server side' });
                        }
                    });
                } else {
                    callback(403, { error: 'Authentication failure' });
                }
            });
        } else {
            callback(400, { error: 'You have a problem in your request.' });
        }
    } else {
        callback(400, { error: 'Invalid Phone Number.Please Try again letter.' });
    }
};

handler._users.delete = (requestProperties, callback) => {
    const phone =        typeof requestProperties.body.phone === 'string' &&
        requestProperties.body.phone.trim().length === 11
            ? requestProperties.body.phone
            : false;
    if (phone) {
        const token =            typeof requestProperties.headersObject.token === 'string'
                ? requestProperties.headersObject.token
                : false;

        tokenHandler._token.verify(token, phone, (tokenId) => {
            if (tokenId) {
                data.read('users', phone, (error, userData) => {
                    if (!error && userData) {
                        data.delete('users', phone, (err) => {
                            if (!err) {
                                callback(200, { message: 'user deleted successfully' });
                            }
                        });
                    } else {
                        callback(500, { error: 'There was a problem in server side' });
                    }
                });
            } else {
                callback(403, { error: 'Authentication failure' });
            }
        });
    } else {
        callback(400, { error: 'There was a problem in your request' });
    }
};

module.exports = handler;
