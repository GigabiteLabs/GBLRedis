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
        // Ensure valid env vars
        if (!process.env.REDIS_CERT || !process.env.REDIS_URL){
            this.log.error('no redis credentials provided at cert path')
            process.exit(1)
        }
        // Ensure valid composed URL in env vars
        if (process.env.REDIS_URL.startsWith("rediss://")) {
            const tls = require('tls')
            var ssl = {
                ca: [ fs.readFileSync(process.env.REDIS_CERT, 'ascii') ]
            }
            // Attempt to create a client
            this.client = redis.createClient(process.env.REDIS_URL, {tls: ssl})
            // handle failure
            .on("error", function(err) {
                this.log.error("FATAL ERROR" + err)
                process.exit(1)
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
                        reject('attempt to deleted failed, no value stored at key!')
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

