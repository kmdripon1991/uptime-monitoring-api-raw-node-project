/*
 * Title: Environments
 * Description: Handle Environments related things
 * Author: Md. Ripon Khan
 * Date: 07/08/2024
 * */

// module scaffolding
const environments = {};

// staging environment
environments.staging = {
    port: 3000,
    envName: 'staging',
    secretKey: 'abcdefgh',
    maxChecks: 5,
    twilio: {
        fromPhone: '+12487960395',
        accountSid: 'ACfef3df7ef1f5658cd5af2c2ab2e8797d',
        authToken: '00448c77efa84095bd86b098ace6edba',
    },
};

// production environment
environments.production = {
    port: 5000,
    envName: 'production',
    secretKey: 'hgfedcba',
    maxChecks: 5,
    twilio: {
        fromPhone: '+12487960395',
        accountSid: 'ACfef3df7ef1f5658cd5af2c2ab2e8797d',
        authToken: '00448c77efa84095bd86b098ace6edba',
    },
};
// Determine which environment passed

const currentEnvironment =    typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';
// Export corresponding environment object

const environmentToExport =    typeof environments[currentEnvironment] === 'object'
        ? environments[currentEnvironment]
        : environments.staging;

// Export module
module.exports = environmentToExport;
