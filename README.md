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

## Config & Use

### Environment Configuration
You'll need to have thee variables exported in your env to enable the connection to Redis

- `export REDIS_CERT="/Pathto/Your.crt"`
- `export REDIS_URL="rediss://admin:$PASS@URL_PATH.databases.appdomain.cloud:32389/0"`
- `export REDIS_PREFIX="${InstanceName}:"` 

### Examples

#### Example Setup
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

#### Example Operations
**Operation Notes / Rules:** 

- All values will be returned as hash maps, so you will need to handle non-null returned values with `JSON.parse()` to convert them back to objects. 

This is an intentional design decision. We can't be sure that you will expect to recieve an object *in all cases* where you retrieve data from Redis.

- Any operations attempted on key paths that are non-existent will not `throw`, instead they will return a `null` value with `resolve()` for graceful error handling.

And finally:

- Any errors from Redis will `throw`, so a try / catch pattern is reccomended.

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
 
 
Set an object in Redis DB

`await redisClient.set('cat',{"name":"snuffles"})`

Get an object from Redis DB

```
let cat = await redisClient.get('cat')
cat = JSON.parse(cat) // Parse the hash map to object
console.log(cat)
```




Update object in Redis DB

`await redisClient.set('cat',{"status":"ran away"})`

**Note:** Redis does not have an update operation, so the process written is custom using `get()` and `set()` operations. Updates are performed **non-destructively** by using `Object.assign()`, rather than simply using `set()` to store a new value.

- The function attempts to `get()` an existing object by the key provided
- If the object does not exist, it uses `resolve(null)` to return null
- If the object does exist, it merges the two objects, preserving unchanged keys and values, and overwriting existing values for the same keys with the newwer data
- It then sets the new merged object at the original key provided and uses `resolve(res)` to indicate success (res is the 'OK' string that Redis returns in a successful operation)



### Environment Vars Explained

1) **REDIS_PREFIX**

In order to meet the goal of safely sharing a single Redis instance among several API servers and applications, there needs to be a method of preventing key / value storage collisions. 

A simple answer is to prefix all keys with a short name of the instance that the key belongs to / was set by.

**Example Use Case** 

- We want to store data at a key named "dogs"
- Our `REDIS_PREFIX` string is "Devops:"
- When we pass the key value: 

`client.set('dogs', {"sound":"woof"})`

- The actual key that the function uses to store the object concatenates the key string and prefix and stores the object at key 'Devops:dogs'
- However, the developer doesn't have to worry about this at all
- Developers: you simply pass in your 'key' string, the prefixing happens at the data layer automatically for you
- This process is also invisibile even in the logs.


**TL;DR**

An instance prefixed with `'Devops:'` could store data at the same key name as another instance that uses this client, to access the same Redis instance and collisions / data overwirtes will be avoided ..

*so long as* (and this is the key) there are **no two applications sharing a Redis instance with the same exact `REDIS_PREFIX` string**.

**Suggested Rules & Conventions:**

Our team adopts these conventions, they help eliminate variability and potential issues with invalid characters / inconsistency. 

You can do whatever you like, this framework does not enforce any of these, they are just agreed conventions internally.

- The `REDIS_PREFIX` MUST be only one word followed immediately by a colon, e.g. 'Hockey:' or 'Devops:'
- The single word must be unique to describe the app or instance it belongs to, and no other instance
- The first letter only should be capitalized, or all should be lowercased
- No numbers or special characters

2) **REDIS_CERT**

- This is a path to a file on your machine of the .crt file that enables full SSL / TLS mutual authentication between your app and Redis

3) **REDIS_URL**

- This is the *composed* url that includes the username (admin) and the password, as well as url path, port, and instance number (/0)

Please reach out to [Dan](https://github.com/DanBurkhardt) if you do not have credentials or are having issues.

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

TODO: Implement a more standard & detailed testing framework instead of direct operations without assertions (such as NYC or Mocha).