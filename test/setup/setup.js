const GBLRedis = require('../../index.js')
const log  = require('../../client/utilities/logger.js')
// // const events module
const { once } = require('events')

before( function() {
    return new Promise(async function(resolve, reject) {
        global.log = log('Mocha Tests')
        global.log.logLevel = 'debug'
        
        // setup client
        global.client = await new GBLRedis()
        const initialized = await global.client.init()
    
         // async wait and listen
        global.log.info('waiting for GBLRedis client config to complete')
        const event = await once(global.client.eventEmitter, 'client ready')
        .then( function() {
            resolve()
        })
        global.log.info('global config for mocha tests finished')
    })
})