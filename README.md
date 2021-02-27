<p align="center"><img src="https://www.gigabitelabs.com/codeassets/gigabitelabs-redis.png" alt="GigabiteLabs" width="350">
</p>

# GigabiteLabs-Redis
A Redis DB client wrapper optimized for sharing a single Redis DB among several organizations, projects, and environments.

[GigabiteLabs](https://gigabitelabs.com) is a creative design & development firm that specializes in engineering surprisingly great apps.
<p>We turn big ideas into big impact 🚀 

## Install
`npm install --save gigabitelabs-redis`

## Features

- Simple configuration, with lots of options
- Multiple platform environment support: compatible with cloud platform environments, as well as direct connections
- Secure: Optimized for TLS / SSL connections to your Redis host (or no auth, as you wish!)
- Complexity & collision reductions by enforcing namespaces for stored data
- Operations fully promise-ified with `async` / `await`
- It won't crash your app: graceful handling of invalid keys with non-throwing return values
- Encapsulation of object storage in a way that makes storing objects feel native


### Requirements

- The target Redis instance needs to support authentication via one of the following methods:
    - SSL / TLS
        - basically all cloud platforms support some version of TLS or SSL using the `redis://` or `rediss://` service protocols.
    - Cloud Platform env variables (only setup for IBM Cloud's environment at the moment)
        - You can still connect to another cloud platform via SSL/TLS though!
    - basic auth (just a password, or by using username and password)
    - no authentication (hey, you do you)
- The target environment must allow you to configure custom env vars (all config & opts are set via process.env)
- Spend some time considering unique namespaces / a naming scheme for each application that attaches to the shared Redis DB.

## Goals

**Goals**
The main goals of this framework are:

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

### Namespaces: The Key to Sharing Redis DB

//  TODO: add docs / explanation

### Environment Configuration

#### Mandatory Env Vars

These vars **must** be configured or the framework will not function properly.

Warning: improper configuration could cause crashes in development (by design). 
be sure to enable a higher level of logging monitor configuration messages upon first setup & config.

| var name | required datatype | purpose | considerations | default | example |
| -------- | ----------------- | ------- | -------------- | ------- | ------- |
| `REDIS_PREFIX`               | string | (no default) | (see expanded notes) | (see expanded notes) | `REDIS_PREFIX="${InstanceName}:"` |
| `REDIS_CONNECTION_METHOD` | string | default is to attempt config via `cloud-env` | explicitly tells the framework what method of establishing a connection to a Redis instance should be used | only one option may be used and only this method will be used. if connection fails, it will not attempt to use another method to reconnect | `REDIS_CONNECTION_METHOD="${'cloud-env', 'direct-ssl-tls', 'basic-auth', 'no-auth'}:"` |



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
| `REDIS_CLIENT_OPTS` | stringified object that is parsable to JSON | set this env var to pass config options supported by the [redis framework](https://npmjs.com/package/redis) through to the underlying framework during initialization | no default value | configuring any options that conflict with the opinionated-nature of this framework, such as prefixes, will be ignored | `REDIS_CLIENT_OPTS=\'{ string_numbers: false }\'` |
| `REDIS_LOG_LEVEL` | string | the level of logging the framework should use. mmust be a level supported by [log4js](https://www.npmjs.com/package/log4js) | `error` | none | `REDIS_LOG_LEVEL=${error, warn, info, debug, trace}` |
| `REDIS_DEFAULT_EXP` | int | the value is used by the framework auto-expire (delete) stored objects. | objects are **not** expired by default | (see expanded notes) | `REDIS_DEFAULT_EXP=3600` // auto-exp all new objs in one hour |

**Expanded Notes**

1) `REDIS_DEFAULT_EXP`: considerations
If a value for this var is set, it will apply to *all* newly created objects. 
However it will not apply to any existing objects. updating an object has no effect on its expiration time, since the exp is only set when storing it for the first time.

If an exp is provided during an operation, that exp *overrides* the value set by this var and will be used instead.

<br><br>

#### Env Vars Required for Cloud Platform Hosted Redis

| var name | required datatype | purpose | considerations | example |
| -------- | ----------------- | ------- | -------------- | ------- |
| `REDIS_CLOUD_PLATFORM_TARGET` | string | specifies one of the supported cloud platforms hosting the Redis service. if set, the framework will attempt a connection using known methods for the respective platform |  | `REDIS_CLOUD_PLATFORM_TARGET=ibmcloud` |

<br><br>

#### Env Vars Required for Direct TLS Connections to Any Redis Host

| var name | required datatype | purpose | considerations | example |
| -------- | ----------------- | ------- | -------------- | ------- |
| `REDIS_SSL_CERT`             | string | specifies the local path to the TLS certificate | `REDIS_CERT="local/path_to/your.crt` |
| `REDIS_COMPOSED_URL`         | string | a composed URL | make sure to include the port number in the URL string. do not set `REDIS_INSTANCE_URL` if you use a composed URL. | `REDIS_URL="rediss://admin:$PASS@URL_PATH.domain.com:${port}/0"` |

checkout this [example script]() for further reference.

<br><br>

#### Env Vars for Basic Auth Connections to Redis

| var name | required datatype | purpose | considerations | example |
| -------- | ----------------- | ------- | -------------- | ------- |
| `REDIS_INSTANCE_URL`         | string | a non-composed URL | make sure to include the port number in the URL string. make sure to include the redis protocol \'redis://\' or \'redis://\' | `REDIS_INSTANCE_URL="redis://yourdomain.com:${port}/0"` |
| `REDIS_BASIC_AUTH_PASS` | string | a valid password for the username to use during basic authentication | if the password contains any special characters, wrap the string in SINGLE quotes to preseve the verbatim formatting | `REDIS_BASIC_AUTH_PASS=mypassword` |
| `REDIS_BASIC_AUTH_USER` | string | (Redis ^6.0) a valid username to use during basic authentication | only compatible with Redis versions 6.0 or higher (^6.0). if your instance has a lower version, may not need a user name, however, check your Redis host documentation for information | `REDIS_BASIC_AUTH_USER=admin` |


<br><br>

#### Env Vars for No Auth Connections to Redis

| var name | required datatype | purpose | considerations | example |
| -------- | ----------------- | ------- | -------------- | ------- |
| `REDIS_INSTANCE_URL`         | string | a non-composed URL | make sure to include the port number in the URL string. make sure to include the redis protocol \'redis://\' or \'redis://\' | `REDIS_INSTANCE_URL="redis://yourdomain.com:${port}/0"` |

<br><br>

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