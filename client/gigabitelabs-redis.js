const redis = require('redis')
const fs = require('fs')
const log = require('./utilities/logger')
const { errors } = require('./constants/messages')
const Setup = require('./setup/setup-config')

// Serves as single application Redis client instance,
// and encapsulates all database operations
class GBLRedis {
    constructor(){
        this.log = log('RedisClient')
        this.env = require('./constants/env')
        this.constants = require('./constants/app-constants')
        this.msgs = require('./constants/messages')
        this.log.trace('RedisClient Instantiated')
        return
    }

    async init() {
        this.log.debug('initializing framework')
        const setup = await new Setup()
        this.redis = await setup.getClient()
        return this
    }

    // Gets a hashmap / object by key name
    async get(key,table){
        const self = this
        return new Promise(function(resolve, reject){
            if(!key) throw 'key missing in function call!'
            try {
                self.redis.hgetall(`${table || ''}:${key}`, function (err, obj) {
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
    async set(key, value, table, userExp){
        const self = this
        return new Promise(function(resolve, reject){
            if(!key || !value) throw 'either key or value missing in function call!'
            try {
                let concatenatedKey = `${table}:${key}`
                self.redis.hmset(concatenatedKey, value, function (err, res) {
                    if(err) throw err
                    if(res == 'OK'){
                        resolve(res)
                    }else{
                        self.log.info(`response was ${res}, something went wrong, returning null`)
                        resolve(null)
                    }
                })
                // async dispatch exp handling
                self.handleExp(key, userExp)
            } catch (e) {
                self.log.error(`Error: ${e}`)
                reject(e)
            }
        })
    }

    // Deletes an object by key
    async del(key, table){
        const self = this
        return new Promise(function(resolve, reject){
            if(!key) throw 'key missing in function call!'
            try {
                let concatenatedKey = `${table || ''}:${key}`
                self.redis.del(concatenatedKey, function (err, res) {
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
    async update(key, value, table){
        const self = this
        return new Promise(async function(resolve, reject){
            if(!key || !value) throw 'either key or value missing in function call!'
            try {
                // Attempt to get the existing object
                let existing = await self.get(key,table)
                if(!existing){
                    self.log.info(`object for key \'${key}\' does not exist, returning null`)
                    resolve(null)
                    return
                }

                // Merge the soure value into the existing by overwriting from value
                let newObj = Object.assign(existing, value)

                // Get the new merged obj at the same key
                self.redis.hmset(`${key}`, newObj, function (err, res) {
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
    /**
     * Handles setting up a key / value pair to automatically 
     * expire (delete) themselves, if an auto-expiration time
     * is either set in the env, or expicitly provided in a 
     * function call.
     * @param {string} key - the key (for the value) that should auto-expire
     * @param {string} userExp - the number of seconds in which to expire,
     * *IF* manually configured by the function call (overrides default)
     */
    async handleExp(key, userExp) {
        // start with env config
        let exp = this.env.config.defaultExp
        // but if user has passed a value, override
        if (userExp && typeof(userExp) == 'number') { exp = userExp }

        // validate non-nil & GT 0
        if((exp != null && exp != undefined)  && exp > 0){
            try {
                await this.redis.expire(key, exp)
                this.log.info(`key: \'${key}\', set to auto expire in  \'${exp}\' seconds`)
            } catch(error) {
                this.log.warn(this.msgs.internal.HANDLE_EXP_FAILED_WITH(error))
            }
        }
    }

    /**
     * A convenience method that allows the caller
     * to directly set a key / value pair's expiration
     * time in the future.
     * @param {string} key - the key (for the value) 
     * that should auto-expire
     * @param {string} exp - the number of seconds after which
     * the key / value should expire
     */
    async setExpiration(key, exp) {
        try {
            await this.redis.expire(key, exp)
            this.log.info(`key: \'${key}\', set to auto expire in  \'${exp}\' seconds`)
        } catch(error) {
            this.log.warn(this.msgs.internal.SET_EXP_FAILED_WITH(error))
        }
    }
}

module.exports = GBLRedis

