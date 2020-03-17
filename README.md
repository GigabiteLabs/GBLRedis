# GBLRedis
Shared Redis client module for GBL API Instances

## Config & Use
### Goals & Intended Use
These are the goals of this framework:
- To allow for a single, consistent, and updatable Redis DB client to be shared amongst several API server instances, as well as other Node.js applications internally.
- To allow different API instances to have a common location for accessing shared credentials and data
- To ensure safety when storing data amongst several instances or applications by prefixing keys with the unique name of that instance or application
- To provide access to shared data through a common prefix that is only used for values shared with multiple instances / apps
- To leverage Redis' HashMap capabilities to store native JS objects in Redis without converting to / from with JSON.pars, or .stringify

To do this, it starts with the env configuration:

### Env Config
You'll need to have thee variables exported in your env to enable the connection to Redis

- `export REDIS_CERT="/Pathto/Your.crt"`
- `export REDIS_URL="rediss://admin:$PASS@URL_PATH.databases.appdomain.cloud:32389/0"`
- `export REDIS_PREFIX="${InstanceName}:"` 

### Env Var Details
**REDIS_PREFIX** 
In order to safely share a single Redis instance among several API servers and applications, there needs to be a method of preventing key / value storage collisions. 

A simple answer is to prefix all keys with a short name of the instance that the key belongs to / was set by.

For ex, if I were to pass in a key named 'dogs', and my instane shortname was 'Devops', the *actual* key that is being used to store the value is 'Devops:dogs'. This way, another instance or application can use the same key name for perhaps even the same operation, and we will not overwrite or otherwise affect each other's stored data.

Now, when you use the client, you don't have to worry about this at all. Simply pass in your 'key' string, the prefixing happens at the data layer automatically for you, and it is invisibile even in the logs. 

Rules:
- This name MUST be only one word followed immediately by a colon, e.g. 'Hockey:' or 'Devops:'
- The single word must be unique to describe the app or instance it belongs to, and no other instance
- The first letter should be capitalized, followed by only lowercase letters and no special characters

**REDIS_CERT**
- This is a path to a file on your machine of the .crt file that enables full SSL / TLS mutual authentication between your app and Redis

**REDIS_URL**
- This is the *composed* url that includes the username (admin) and the password, as well as url path, port, and instance number (/0)

Please reach out to [Dan](https://github.com/DanBurkhardt) if you do not have credentials or are having issues.

