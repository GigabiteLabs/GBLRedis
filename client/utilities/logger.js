var log4js = require('log4js');

module.exports = function (className) {
    var logger = log4js.getLogger(className)
    logger.level = process.env.REDIS_LOG_LEVEL || 'error'
    return logger
}