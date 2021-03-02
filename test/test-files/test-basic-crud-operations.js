const assert = require('assert')
const should = require('chai').should()
const { v4: uuid } = require('uuid')
const { objectsEqual } = require('./utils/utils')

describe('Basic CRUD Operations', function() {
    describe('set, get, delete data', function() {
      const seedTableName = 'test-set'
      const seedDataId =  uuid()
      let seedData = new Object()
      seedData.id = seedDataId
      seedData.foo = 'bar'

      it('should successfully set data', async function() {
        // set seed data
        let res = await global.client.set(seedDataId, seedData, seedTableName)
        global.log.debug(res)
        assert.equal(res, 'OK')
      })

      it('should successfully get data', async function() {
        // set seed data
        let res = await global.client.get(seedDataId, seedTableName)
        global.log.debug(res)
        // compare objects
        await objectsEqual(seedData, res)
      })
    })

    describe('set, get, update, delete data', function() {
      const seedTableName = 'test-update'
      const seedDataId =  uuid()
      let seedData = new Object()
      seedData.id = seedDataId
      seedData.foo = 'bar'
      seedData.cats = 'meow'
      seedData.fingers = 'gonna fing'
      seedData.name = 'none'

      let setResponse
      let updateResponse
      let getResponse
      let deleteResponse

      it('should successfully set data', async function() {
        // set seed data
        setResponse = await global.client.set(seedDataId, seedData, seedTableName)
        global.log.debug(`set data: ${setResponse}`)
        assert.equal(setResponse, 'OK')
      })

      it('should successfully update data', async function() {
        // change data
        seedData.name = 'FooBaz'

        // set seed data
        updateResponse = await global.client.update(seedDataId, seedData, seedTableName)
        global.log.debug(`update data: ${updateResponse}`)
        assert.equal(updateResponse, 'OK')

        // set seed data
        getResponse = await global.client.get(seedDataId, seedTableName)
        global.log.debug(`get data: ${JSON.stringify(getResponse)}`)
        // compare objects
        await objectsEqual(seedData, getResponse)
      })

      it('should successfully delete data', async function() {


        // set seed data
        deleteResponse = await global.client.del(seedDataId, seedTableName)
        global.log.debug(`delete data: ${deleteResponse}`)
        assert.equal(deleteResponse, 'successfully deleted')

        // // set seed data
        // getResponse = 
        // global.log.debug(`get data: ${JSON.stringify(getResponse)}`)
        // compare objects
        await assert.equal(await global.client.get(seedDataId, seedTableName), null)
      })
    })
  })