const IBMCloud = require("../connections/cloud/ibmcloud")

/**
 * All supported, raw env variables from
 * destructured from process.env.
 */
const raw = {
    VCAP_SERVICES: process.env.VCAP_SERVICES,
    REDIS_CLOUD_PLATFORM_TARGET: process.env.REDIS_CLOUD_PLATFORM_TARGET,
    REDIS_PREFIX: process.env.REDIS_PREFIX,
    REDIS_CERT: process.env.REDIS_CERT,
    REDIS_SSL_CERT: process.env.REDIS_SSL_CERT,
    REDIS_COMPOSED_URL: process.env.REDIS_COMPOSED_URL,
    REDIS_URL: process.env.REDIS_URL
}

/**
 * An object containing mandatory
 * configuration variables
 * 
 * @type {Object} 
 * @property {string} prefix - The configured prefix for 
 * to use in separating the instance's data from other
 * instances that share the same DB.
 */
const config = {
    prefix: raw.REDIS_PREFIX
}

/**
 * 
 * 
 * @type {Object}
 * @property {boolean} vcapRaw - Indicates whether the Courage component is present.
 * @property {boolean} cloudPlatform - Indicates whether the Power component is present.
 */
const ibm = {
    /** { @type {} } */
    vcapRaw: raw.VCAP_SERVICES,
    vcap: (vcapRaw) => { return JSON.parse(vcapRaw) },
    vcapRedis: (vcap) => { return vcap['databases-for-redis'][0] },
    redisAuth: (vcapRedis) => { 
        const {
            credentials: {
                connection: {
                    rediss: {
                        composed: [composedUrl],
                        certificate: { certificate_base64: certificate }
                    },
                },
            }
        } = vcapRedis
        return { composedUrl, certificate }
     },
     ca: (certificate) => { return Buffer.from(certificate, 'base64').toString('utf-8') },
     sslConfig: (ca) => {
         return {
            ca: [ ca ]
         }
    },
    tlsConfig: (sslConfig) => { return {tls: sslConfig} },
    connectionURL: (redisAuth) => { 
        const { composedURL } = redisAuth
        return composedURL
    }
}


const cloud = {
    platform: raw.REDIS_CLOUD_PLATFORM_TARGET,
    ibm: ibm
}

/**
* An object encapsulating all
* required values used in making
* an SSL connection to Redis.
* 
* @type {Object}
* @property {string} sslCert - A base64 encoded string representing 
* the CA certificate used to establish the SSL conection to redis.
* 
* @property {string} url - A composed URL for use in establisting an
* SSL connection to Redis.
*/
const ssl = {
    sslCert: raw.REDIS_CERT || raw.REDIS_SSL_CERT,
    composedUrl: raw.REDIS_URL || raw.REDIS_COMPOSED_URL
}

/** @module constants/env  */
module.exports = {
    raw: raw,
    config: config,
    cloud: cloud,
    ssl: ssl
}