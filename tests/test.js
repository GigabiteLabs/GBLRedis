const tester = require('./redisTests')

const start = async () => {
    console.log('setting up client')
    const gblRedis = await require('../index')()
    const client = await gblRedis.init()
    // run tests
    const result = await tester(client)
    console.log('finished running tests')
}

console.log('starting tests ..')
start()




