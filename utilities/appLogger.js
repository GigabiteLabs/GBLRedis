var log4js = require('log4js');

module.exports = function (className) {
    var logger = log4js.getLogger(className)
    const logLevel = process.env.REDIS_LOG_LEVEL
    if (logLevel) {
        logger.level = logLevel
        return logger
    } else {
        return
    }
}