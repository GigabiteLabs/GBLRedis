const GBLRedis = require('./client/gigabitelabs-redis')
module.exports = async () => {
    const gblRedis = await new GBLRedis()
    return gblRedis
}