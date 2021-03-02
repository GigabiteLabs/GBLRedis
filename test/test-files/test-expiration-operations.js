const assert = require('assert')
const should = require('chai').should()
const { v4: uuid } = require('uuid')
const { objectsEqual, timeout } = require('./utils/utils')
const mocha = require('mocha');

describe('Expiration Operations', function() {
    describe('set an object with an expiration time', function() {
        const seedTableName = 'test-expiration'
        const seedDataId =  uuid()
        let seedData = new Object()
        seedData.id = seedDataId
        seedData.foo = 'blembech'
        const expSecs = 3

        it('should set data with exp time, get null', async function() {
            // set seed data
            let res = await global.client.set(seedDataId, seedData, seedTableName, expSecs)
            global.log.debug(res)
            assert.equal(res, 'OK')

            let sleepMs = (expSecs + 1) * 1000
            await timeout(sleepMs)
            let expRes = await global.client.get(seedDataId, seedTableName)
            assert.equal(expRes, null)
        })
    })
})