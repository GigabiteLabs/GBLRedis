    // shouldUseSSLConfig() {
    //     const certPathProvided = (process.env.REDIS_CERT || process.env.REDIS_SSL_CERT)
    //     const urlProvided = (process.env.REDIS_URL || process.env.REDIS_COMPOSED_URL)
    //     this.log.trace(`should use ssl?: ${((certPathProvided && urlProvided) == true)}`)
    //     return certPathProvided && urlProvided
    // }

    // async setupWithSSLConfig() {
    //     // extract vars
    //     const { REDIS_CERT, REDIS_SSL_CERT, REDIS_URL, REDIS_COMPOSED_URL} = process.env
    //     const cert = REDIS_CERT || REDIS_SSL_CERT
    //     const url = REDIS_URL || REDIS_COMPOSED_URL
    //     // setup a secure client with SSL & return
    //     try {
    //         // Ensure valid composed URL in env vars
    //         if (url.startsWith("rediss://")) {
    //             const tls = require('tls')
    //             var ssl = {
    //                 ca: [ fs.readFileSync(cert, 'ascii') ]
    //             }
    //             // create a client
    //             return await redis.createClient(url, {tls: ssl})

    //             // handle failure
    //             .on("error", function(err) {
    //                 throw `\n\ngigbatielabs-redis: ERROR: Redis client could not be configured, error: ${err}`
    //             })
    //         } else {
    //             throw `\n\n\n\n`
    //             process.exit(1)
    //         }
    //     } catch(error) {
    //         throw error
    //     } 
    // }