// for reading local credential files
const fs = require('fs')

/**
 * All supported, raw env variables from
 * destructured from process.env.
 */
const raw = {
    // mandatory
    REDIS_PREFIX: process.env.REDIS_PREFIX,
    REDIS_CONNECTION_METHOD: process.env.REDIS_CONNECTION_METHOD,    
    // optional
    REDIS_CLIENT_OPTS: process.env.REDIS_CLIENT_OPTS,
    // cloud platform connections
    VCAP_SERVICES: process.env.VCAP_SERVICES,
    REDIS_CLOUD_PLATFORM_TARGET: process.env.REDIS_CLOUD_PLATFORM_TARGET,
    // direct SSL TLS connections
    REDIS_CERT: process.env.REDIS_CERT,
    REDIS_SSL_CERT: process.env.REDIS_SSL_CERT,
    REDIS_COMPOSED_URL: process.env.REDIS_COMPOSED_URL,
    REDIS_URL: process.env.REDIS_URL,
    // basic-auth / no-auth connections
    REDIS_INSTANCE_URL: process.env.REDIS_INSTANCE_URL,
    REDIS_BASIC_AUTH_PASS: process.env.REDIS_BASIC_AUTH_PASS,
    REDIS_BASIC_AUTH_USER: process.env.REDIS_BASIC_AUTH_USER,
    REDIS_DEFAULT_EXP: process.env.REDIS_DEFAULT_EXP
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
    prefix: raw.REDIS_PREFIX,
    defaultExp: raw.REDIS_DEFAULT_EXP,
    configuredClientOpts: raw.REDIS_CLIENT_OPTS,
    redisClientOpts: async () => { 
        let defaultOpts = { prefix: raw.REDIS_PREFIX }
        if (raw.REDIS_CLIENT_OPTS) {
            let log = require('../utilities/logger')('redisClientOpts')
            try {
                log.trace('parsing additional redis client options')
                const additionalOpts = JSON.parse(raw.REDIS_CLIENT_OPTS)
                const clientOpts = Object.assign(defaultOpts, additionalOpts)
                return clientOpts
            } catch(error) {
                let msgs = require('../constants/messages')
                throw `${msgs.errors.REDIS_CLIENT_OPTIONS_NOT_PARSABLE} raw error: ${error}`
            }
        } else {
            return defaultOpts
        }
    },
    connectionMethod: raw.REDIS_CONNECTION_METHOD
}

/**
 * An object encapsulating all env vars 
 * required for making a connection
 * to a redis instance hosted on IBM Cloud.
 * 
 * @typedef {object}
 * @property {string} vcapRaw - the raw env var `VCAP_SERVICES`
 * 
 */
const ibm = {
    vcapRaw: raw.VCAP_SERVICES,
    /**
     * @property {function} - a closure that parses `VCAP_SERVICES` to a
     * JS object.
     * @argument {object} vcapRaw - the raw value for `VCAP_SERVICES`
     * @returns {object} - a parsed `Object` from raw env var `VCAP_SERVICES`
     */
    vcap: (vcapRaw) => { return JSON.parse(vcapRaw) },
    /**
     * @property {function} - a closure that parses the redis portion
     * @argument {object} vcap - a parsed object representing `VCAP_SERVICES`
     * from the `vcap` object.
     * @returns {object} - the redis-specific portion of `VCAP_SERVICES`
     */
    vcapRedis: (vcap) => { return vcap['databases-for-redis'][0] },
    /**
     * @property {function} - a closure that creates and returns the tuple to 
     * use in an attempt to connect to Redis on IBM Cloud.
     * @argument {object} vcapRedis - the redis credentials parsed from
     * `VCAP_SERVICES`
     * @returns {object} - @returns {Object} { connectionURL: string, tlsConfig: object },
     * a tuple containing destructurable values to use in the client connection.
     */
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
    /**
     * @property {function} - a closure that decodes a base64 CA certificate
     * to plain text
     * @argument {object} certificate - a base64 encoded CA certificate
     * @returns {object} - tuple containing destructurable ssl config values
     */
     ca: (certificate) => { return Buffer.from(certificate, 'base64').toString('utf-8') },
     /**
      * @property {object} sslConfig - an object configured with the CA certificate to use 
      * in the ssl connection to Redis on IBM Cloud.
      * @param {string} ca - a plaintext string representing the ca certificate
      */
     sslConfig: (ca) => {
         return {
            ca: [ ca ]
         }
    },
    /**
     * @property {function} - a closure that converts an `sslConfig` object to
     * the final tlsConfig object to use in an SSL connection to Redis on 
     * IBM Cloud.
     * @argument {object} sslConfig - an object derived from the property `sslConfig`.
     * @returns {object} - the final tls connection configuration.
     */
    tlsConfig: (sslConfig) => { return {tls: sslConfig} },
    /**
     * @property {function} - a closure that parse a composed url out of the
     * Redis auth portion of `VCAP_SERVICES`.
     * @argument {object} redisAuth - the Redis portion of the parsed `VCAP_SERVICES` object.
     * @returns {string} - the composed URL string to use in the connection to Redis hosted
     * on IBM Cloud.
     */
    connectionURL: (redisAuth) => { 
        const { composedURL } = redisAuth
        return composedURL
    }
}

/**
* An object encapsulating all
* variables and objects used
* in establishing cloud platform
* connections
* @typedef {Object}
*
* @see IBMCloud
*/
const cloud = {
    /** 
    * @property {string} platform - the value configured in 
    * the env var for `REDIS_CLOUD_PLATFORM_TARGET`
    */
    platform: raw.REDIS_CLOUD_PLATFORM_TARGET,
    /**
    * @property {object} ibm - an object encapsulating
    * all env vars required for making a connection
    * to a redis instance hosted on IBM Cloud.
    */
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
    certificatePath: raw.REDIS_CERT || raw.REDIS_SSL_CERT,
    composedURL: raw.REDIS_URL || raw.REDIS_COMPOSED_URL,
    tlsConfig: async (certPath) => { 
        return {
            tls: {
                ca: [ await fs.readFileSync(certPath, 'ascii') ]
            }
        }
    }
}

/**
* An object encapsulating all
* required values for basic
* authentication with Redis
* using a password, or user & password 
* (Redis ^6.0 )
* 
* @type {Object}
* @property {string} instanceURL - A base64 encoded string representing 
* the CA certificate used to establish the SSL conection to redis.
* @property {string} pass - password for basic auth on all Redis versions
* where a password is enabled.
* @property {string} user - optional user to use on all 
* Redis v6.0 or higher instances.
*/
const basic = {
    connectionURL: raw.REDIS_INSTANCE_URL,
    user: raw.REDIS_BASIC_AUTH_USER,
    pass: raw.REDIS_BASIC_AUTH_PASS
}

/**
 * An object with values
* required for a no-auth
* connection to Redis.
* @typedef {Object}
* @property {string} instanceURL - the url
* location of the Redis instance.
*/
const noauth = {
    connectionURL: raw.REDIS_INSTANCE_URL,
}

/** @module constants/env  */
module.exports = {
    raw: raw,
    config: config,
    cloud: cloud,
    ssl: ssl,
    basic: basic,
    noauth: noauth
}