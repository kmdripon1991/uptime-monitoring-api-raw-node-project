/*
 *Title: Token Hndler
 * Description: Hadndler to handle token related routes
 * Author: Md. Ripon Khan
 * Date: 13/08/2024
 * */

//  Dependencies
const data = require('../lib/data');
const { parseJSON } = require('../helper/utilities');
const { hash } = require('../helper/utilities');
const { createRandomString } = require('../helper/utilities');

// module scaffolding
const handler = {};

handler.tokenHandler = (requestProperties, callBack) => {
    const acceptedRoutes = ['post', 'get', 'put', 'delete'];
    if (acceptedRoutes.indexOf(requestProperties.method) > -1) {
        handler._token[requestProperties.method](requestProperties, callBack);
    } else {
        callBack(404);
    }
};

handler._token = {};

handler._token.post = (requestProperties, callBack) => {
    const phone =        typeof requestProperties.body.phone === 'string' &&
        requestProperties.body.phone.trim().length === 11
            ? requestProperties.body.phone
            : false;
    const password =        typeof requestProperties.body.password === 'string' &&
        requestProperties.body.password.trim().length > 0
            ? requestProperties.body.password
            : false;

    if (phone && password) {
        data.read('users', phone, (readError, userData) => {
            if (!readError) {
                const hashedPassword = hash(password);
                if (hashedPassword === parseJSON(userData).password) {
                    const tokenId = createRandomString(20);
                    const expires = Date.now() + 60 * 60 * 1000;
                    const tokenObj = {
                        phone,
                        id: tokenId,
                        expires,
                    };
                    data.create('tokens', tokenId, tokenObj, (createError) => {
                        if (!createError) {
                            callBack(200);
                        } else {
                            callBack(500, { error: 'There was a server side problem' });
                        }
                    });
                }
            } else {
                callBack(500, { error: 'There was a problem in server side' });
            }
        });
    } else {
        callBack(404, { error: 'Invalid user' });
    }
};
handler._token.get = (requestProperties, callBack) => {
    // check the id if valid
    const id =        typeof requestProperties.queryStringObject.id === 'string' &&
        requestProperties.queryStringObject.id.trim().length === 20
            ? requestProperties.queryStringObject.id
            : false;
    // console.log(requestProperties);

    // look up the token
    if (id) {
        data.read('tokens', id, (err, tokenData) => {
            const tokenObj = { ...parseJSON(tokenData) };
            if (!err && tokenObj) {
                callBack(200, tokenObj);
            } else {
                callBack(404, { error: 'Requested token was not found' });
            }
        });
    } else {
        callBack(404, { error: 'Requested token was not found' });
    }
};

handler._token.put = (requestProperties, callBack) => {
    const id =        typeof requestProperties.body.id === 'string' &&
        requestProperties.body.id.trim().length === 20
            ? requestProperties.body.id
            : false;

    const extend = !!(
        typeof requestProperties.body.extend === 'boolean' && requestProperties.body.extend === true
    );
    if (id && extend) {
        data.read('tokens', id, (readError, tokenData) => {
            const tokenObj = parseJSON(tokenData);

            if (tokenObj.expires > Date.now()) {
                tokenObj.expires = Date.now() + 60 * 60 * 1000;
                data.update('tokens', id, tokenObj, (err) => {
                    if (!err) {
                        callBack(200);
                    } else {
                        callBack(500, { error: 'There was a problem in server side' });
                    }
                });
            } else {
                callBack(400, { error: 'Token already expired' });
            }
        });
    } else {
        callBack(400, { error: 'There was a problem in your request' });
    }
};

handler._token.delete = (requestProperties, callBack) => {
    const id =        typeof requestProperties.queryStringObject.id === 'string' &&
        requestProperties.queryStringObject.id.trim().length === 20
            ? requestProperties.queryStringObject.id
            : false;

    if (id) {
        data.read('tokens', id, (readErr) => {
            if (!readErr) {
                data.delete('tokens', id, (err) => {
                    if (!err) {
                        callBack(200, { message: 'token deleted successfully' });
                    } else {
                        callBack(500, { error: 'There was a server side problem' });
                    }
                });
            } else {
                callBack(500, { error: 'There was a problem in server side' });
            }
        });
    } else {
        callBack(400, { error: 'There was a problem in your request' });
    }
};

// token verify
handler._token.verify = (id, phone, callBack) => {
    data.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
            if (parseJSON(tokenData).phone === phone && parseJSON(tokenData).expires > Date.now()) {
                callBack(true);
            } else {
                callBack(false);
            }
        } else {
            callBack(false);
        }
    });
};

// export module
module.exports = handler;
