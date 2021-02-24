const redis = require('redis')
const fs = require('fs')
const log = require('../utilities/appLogger.js')('RedisClient')

// Serves as single application Redis client instance,
// and encapsulates all database operations
class RedisClient {

    constructor(){
        this.log = log
        this.log.trace('RedisClient Instantiated')
        this.prefix = process.env.REDIS_PREFIX
        
        // check if the framework is minimally
        // configured and may proceed to setup
        switch (this.canProceedToSetup()) {
        case true:
            switch (this.shouldUseSSLConfig()){
            case true:
            case false:
            default:
                // fatal
            }
        default:
            // fatal
        }
        
        {
            this.log.error('no redis credentials provided at cert path')
            process.exit(1)
        }

    }

    async canProceedToSetup() {
        return this.shouldUseSSLConfig() || this.sholdUseCloudPlatformConfig()
    }

    async setupWithCloudPlatformConfig() {
        switch(process.env.REDIS_CLOUD_PLATFORM_TARGET) {
        case 'ibmcloud':
            // source env from VCAP
        default:
            // fartal error
        }
        
    }

    async sholdUseCloudPlatformConfig() {
        const supportedPlatforms = ['ibmcloud']
        // env var must be set, 
        // and one of the supported options
        return ((process.env.REDIS_CLOUD_PLATFORM_TARGET) && supportedPlatforms.includes(process.env.REDIS_CLOUD_PLATFORM_TARGET))
    }

    async shouldUseSSLConfig() {
        const certPathProvided = (process.env.REDIS_CERT || process.env.REDIS_SSL_CERT)
        const urlProvided = (process.env.REDIS_URL || process.env.REDIS_COMPOSED_URL)
        return certPathProvided && urlProvided
    }

    async setupWithSSLConfig() {
        const { REDIS_CERT, REDIS_SSL_CERT, REDIS_URL, REDIS_COMPOSED_URL} = process.env
        const cert = REDIS_CERT || REDIS_SSL_CERT
        const url = REDIS_URL || REDIS_COMPOSED_URL

        // Ensure valid composed URL in env vars
        if (url.startsWith("rediss://")) {
            const tls = require('tls')
            var ssl = {
                ca: [ fs.readFileSync(cert, 'ascii') ]
            }
            // Attempt to create a client
            this.client = redis.createClient(url, {tls: ssl})
            // handle failure
            .on("error", function(err) {
                this.log.error("ERROR: Redis client could not be configured: " + err)
            })

        } else {
            this.log.error('Invalid redis URL provided in env vars')
            process.exit(1)
        }
    }

    // A test function to prove set/get 
    async testSetGet(){
        try {
            await this.client.hmset(`${this.prefix}test`, "foo", "bar")
            await this.client.hgetall(`${this.prefix}test`, function (err, reply) {
                if (err) throw err
                console.log('\ncalled test, testing storage and retrieval of dummy value {\"foo\":\"bar\"} .. ')
                console.log(`Retrieval of dummy value success: \'${JSON.stringify(reply)}\', proceed.`)
            })
        }catch(e){
            this.log.error(e)
        }
    }

    // Gets a hashmap / object by key name
    async get(key){
        const self = this
        return new Promise(function(resolve, reject){
            if(!key) throw 'key missing in function call!'
            try {
                self.client.hgetall(`${self.prefix}${key}`, function (err, obj) {
                    if(err) throw err
                    if(obj){
                        resolve(obj)
                    }else{
                        self.log.info(`object for key \'${key}\' does not exist, returning null`)
                        resolve(null)
                    }
                })
            } catch (e) {
                self.log.error(`Error: ${e}`)
                reject(e)
            }
        })
    }

    // Sets an object in by key / valus
    async set(key,value){
        const self = this
        return new Promise(function(resolve, reject){
            if(!key || !value) throw 'either key or value missing in function call!'
            try {
                self.client.hmset(`${self.prefix}${key}`, value, function (err, res) {
                    if(err) throw err
                    if(res == 'OK'){
                        resolve(res)
                    }else{
                        self.log.info(`response was ${res}, something went wrong, returning null`)
                        resolve(null)
                    }
                })
            } catch (e) {
                self.log.error(`Error: ${e}`)
                reject(e)
            }
        })
    }

    // Deletes an object by key
    async del(key){
        const self = this
        return new Promise(function(resolve, reject){
            if(!key) throw 'key missing in function call!'
            try {
                self.client.del(`${self.prefix}${key}`, function (err, res) {
                    if(err) throw err
                    if(res == 1){
                        resolve('successfully deleted')
                    }else{
                        self.log.info('attempt to deleted failed, no value stored at key!')
                        resolve(null)
                    }
                })
            } catch (e) {
                self.log.error(`Error: ${e}`)
                reject(e)
            }
        })
    }

    // Updates an object by key / value by getting existing, merging them with assign, 
    // and re-setting the merged object
    async update(key,value){
        const self = this
        return new Promise(async function(resolve, reject){
            if(!key || !value) throw 'either key or value missing in function call!'
            try {
                // Attempt to get the existing object
                let existing = await self.get(key)
                if(!existing){
                    self.log.info(`object for key \'${key}\' does not exist, returning null`)
                    resolve(null)
                    return
                }

                // Merge the soure value into the existing by overwriting from value
                let newObj = Object.assign(existing, value)

                // Get the new merged obj at the same key
                self.client.hmset(`${self.prefix}${key}`, newObj, function (err, res) {
                    if(err) throw err
                    if(res == 'OK'){
                        resolve(res)
                    }else{
                        self.log.info('something failed, returning null')
                        resolve(null)
                    }
                })
            } catch (e) {
                self.log.error(`Error: ${e}`)
                reject(e)
            }
        })
    }
}

module.exports = RedisClient

