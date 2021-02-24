<p align="center"><img src="https://www.gigabitelabs.com/codeassets/gigabitelabs-redis.png" alt="GigabiteLabs" width="350">
</p>

# GigabiteLabs-Redis
A Redis DB client for sharing a Redis DB instance among several Node.js applications.

[GigabiteLabs](https://gigabitelabs.com) is a creative design & development firm that specializes in engineering surprisingly great apps.
<p>We turn big ideas into big impact 🚀 

## Install
`npm install --save gigabitelabs-redis`

## Features

- Operations fully promise-ified with `async` / `await`
- Graceful handling of invalid keys with non-throwing return values
- Encapsulation of object storage, making object storage feel native
- Optimized for TLS / SSL connections to Redis

### Requirements

- Your Redis instance needs to support TLS / SSL
- Your Redis instance should be able to use a `rediss://` composed string
- Each node.js app / instance that adopts this package has a unique name to be used as a key storage namespace

Some services that support TLS / SSL connections to Redis instances are IBM Cloud, AWS, Azure, and of course you could always configure a custom publicly accessible instance yourself.

## Goals
The main goals of this framework:

- To enable adopters to share access to a secure public Redis instant with several API server instances or Node.js applications
- To ensure safety and collision-prevention while sharing data amongst several instances by using instance-specific key naming conventions
- To make it possible for various apps within an org to share data by using common key-prefix naming conventions
- To make it easy to store native objects as well as strings with little-to-no parsing or stringification necessary 

## Setup & Usage

### Setup
Instantiate this module as a client

```
let redisClient = require('gigabitelabs-redis')
```

Set this client on your `express.js` server application for app-wide use later

```
let redisClient = require('gigabitelabs-redis')
app.set('redis', redisClient)
```

Recall the client and use it later in an endpoint request from the `req` object:

```
function endpointFuncNeedsRedis(req, res){
    let redisClient = req.app.settings.redis
    redisClient.set('newDataKey', {"omg":"newData"})
}
```

### Usage Examples

**Operation Notes / Rules:** 

- All values will be returned as hash maps, so you will need to handle non-null returned values with `JSON.parse()` to convert them back to objects. 

This is an intentional design decision. We can't be sure that you will expect to recieve an object *in all cases* where you retrieve data from Redis.

- Any operations attempted on key paths that are non-existent will **not** `throw`. Errors will be logged, and return values will return as `null` value through `resolve()` for graceful error handling.

And finally:

- Since errors do **not**  `throw`, a try / catch pattern is reccomended.

Therefore, a conditional that check on return values after using `await` is reccomended:

```

// Check if response was null
 if(!res){
 	// do something upon error condition
 }
 
 // Check if response was not null
 if(res){
 	// do something upon success
 }
```

Call the test function. Results will print to the log

`redisClient.testSetGet()`
 
**Store an object in Redis DB**

`await redisClient.set('cat',{"name":"snuffles"})`


**Get an object from Redis DB**

```
let cat = await redisClient.get('cat')
cat = JSON.parse(cat) // Parse the hash map to object
console.log(cat)
```


**Update object in Redis DB**

`await redisClient.set('cat',{"status":"ran away"})`

**Note:** Redis does not have an update operation, so the process written is custom using `get()` and `set()` operations. Updates are performed **non-destructively** by using `Object.assign()`, rather than simply using `set()` to store a new value.

- The function attempts to `get()` an existing object by the key provided
- If the object does not exist, it uses `resolve(null)` to return null
- If the object does exist, it merges the two objects, preserving unchanged keys and values, and overwriting existing values for the same keys with the newwer data
- It then sets the new merged object at the original key provided and uses `resolve(res)` to indicate success (res is the 'OK' string that Redis returns in a successful operation)

**Delete an object in Redis DB**

// TODO: Add

<br>

### Environment Configuration

#### Mandatory Env Vars

These vars **must** be configured or the framework will not function properly and may crashe.

| var name | required datatype | purpose | considerations | example |
| -------- | ----------------- | ------- | -------------- | ------- |
| `REDIS_SSL_CERT`             | string | specifies the local path to the TLS certificate | `REDIS_CERT="local/path_to/your.crt` |
| `REDIS_INSTANCE_URL`         | string | a non-composed URL | if this value is set, the value / config for `REDIS_COMPOSED_URL` will be ignored | `REDIS_INSTANCE_URL="https://yourdomain.com:${port}/0"` |
| `REDIS_COMPOSED_URL`         | string | a composed URL | do not set `REDIS_INSTANCE_URL` if you use a composed URL. | `REDIS_URL="rediss://admin:$PASS@URL_PATH.domain.com:${port}/0"` |
| `REDIS_PREFIX`               | string | (see expanded notes) | (see expanded notes) | `REDIS_PREFIX="${InstanceName}:"` |

**Expanded notes:**

1) `REDIS_PREFIX`: purpose
 The value set is used as a prefix on all object keys. This configuration is used automatically and segregates data by prefixing the keys for all data operatons with this string. 
 
 The prefix is **invisible** to the client application, you **do not need** to explicitly use this value in any operations, the client framework uses it automatically. 
 
 Prefixing keys is a low-cost solution to enabling data paritioning, allowing multiple application instances to use the same database without collisions. 

2) `REDIS_PREFIX`: considerations
This client framework is designed for flexible use in production software environments, which typically feature development & devops configurations that allow an application to exist in several states of reliability (ex: local / test, dev, preprod, prod, etc.)

 Provisioning a separate database service for each application instance is a costly and unmanagable arrangement, therefore, this framework allows a **single Redis DB service** to be safely shared among all instances of an application.
 
To do this right, you need to make sure that each of your instances uses a unique string appropriate to it's environment. For example: 'test', 'dev', 'preprod', 'prod'.

This configuration also could potentially allow a single database service to be shared among all instances of *multiple projects* just by using a more specific prefix string. For example: 'projectone-dev', prjectone-preprod' versus 'projecttwo-dev', prjecttwo-preprod'. 

How you use naming conventions for prefixing is up to you, but once they are set, they cannot be changed without manually migrating all data, which is outside the scope of this framework at this time.

<br>
#### Optional Env Vars

The following env vars are not mandatory, and allow you some control over the framework behavior, defaults, and cloud platform config.

| var name | required datatype | purpose | default | considerations | example |
| -------- | ----------------- | ------- | ------- | -------------- | ------- |
| `REDIS_LOG_LEVEL` | string | the level of logging the framework should use. mmust be a level supported by [log4js](https://www.npmjs.com/package/log4js) | `REDIS_LOG_LEVEL=${error, warn, info, debug, trace}` |
| `REDIS_DEFAULT_EXP` | int | the value is used by the framework auto-expire (delete) stored objects. | objects are **not** expired by default | if set, it will apply to *all* newly created objects, however it will not apply to any existing objects. updating an object has no effect on its expiration time, exp is only set when storing it for the first time. if an exp is provided during an operation, that exp *overrides* the value set by this var and will be used instead | `REDIS_DEFAULT_EXP=3600` // auto-exp all new objs in one hour |
| `REDIS_CLOUD_PLATFORM_TARGET` | string | the string specifies one of the supported cloud platforms where the Redis instance is hosted. if set to a supported platform value, the framework will attempt to read all connection credentials from the platform's environment, according to the platform's developer documentation | no default value |  `REDIS_CLOUD_PLATFORM_TARGET=${ibmcloud}` |

<br>

#### Deprecated Env Vars

- these env vars are officially deprecated, which means they may be removed at any time
- to prevent breaking any existing applications, we will continue to support both old and new for a period of time
    - eventually these will be totally removed, so please be sure to update your env config

| ------------ | -------------------- | ------ | --------------- |
| var name     | new var name         | reason | date deprecated |
| `LOG_LEVEL`  | `REDIS_LOG_LEVEL`    | using 'REDIS" prefix to prevent accidental collision with an app's generic env vars | 2/24/2021 |
| `REDIS_CERT` | `REDIS_SSL_CERT`     | we are adding support for a JSON env var that does the same, so we need to separate the two | 2/24/2021 |
| `REDIS_URL`  | `REDIS_COMPOSED_URL` | we're adding support for instances that are not accessible through a composed URL, so we need less ambigous naming | 2/24/2021 |

<br>

## Tests

**Warning:** These tests will use the live Redis instance that is configured with your env vars. 

All data at the keys `test` & `cats` will be overwritten and modified. Please ensure you don't have any necessary data stored in Redis at those key paths.

What is tested:

This is a fairly basic set of tests that only explicitly tests:

- If a successful connection to Redis is made with the env vars provided
- If test data can be stored
- If test data can be retrieved
- If test data can be updated
- If test data can be deleted

These tests also implicitly test:

- Execution time, inferred by looking at the timestamps on the logs
- Successful logging of CRUD events
- Graceful handling of invalid CRUD operation events by using `resolve(null)` instead of using `throw` to ensure that a try/catch doesn't catch in an error block if there wasn't exrpressly an error in the operation vs simply an invalid key or something similar

To run:

- clone the repo
- cd to the root of the repo folder
- run `npm run test` 