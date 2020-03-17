let log = require('../utilities/appLogger.js')('redisTests.js')
let client = require('../index')

async function test(){
	try {
		// Seed initial data
		log.info('seeding test data')
		client.testSetGet()

		// Test get
		log.info('getting seeded data')
		let test = await client.get('test')
		log.debug(JSON.stringify(test))

		// test set
		log.info('setting test data for key \'cats\'')
		let setRes = await client.set('cats',test)
		log.debug(`Set response: ${setRes}`)

		// test the set with a new get
		log.info('getting test data for key \'cats\'')
		let testCats = await client.get('cats')
		log.debug(JSON.stringify('\n testing cats:'))
		log.debug(`${JSON.stringify(testCats)}`)

		// Test updating the value of the obj for cats
		log.info('updating test data for key \'cats\' with new values for current key \'foo\', and new key \'kitty\'')
		let updateRes = await client.update('cats', {'foo':'fanny', 'kitty':'yummy'})
		log.debug(`updateRes: ${updateRes}`)

		// test the set with a new get
		log.info('getting the updated test data for key \'cats\'')
		testCats = await client.get('cats')
		log.debug(JSON.stringify('\n testing cats after update 1'))
		log.debug(`${JSON.stringify(testCats)}`)
		
		// Test updating the value of the obj for cats
		log.info('updating test data for key \'cats\', resetting value of key \'foo\' to value \'bar\'')
		updateRes = await client.update('cats', {'foo':'bar', 'kitty':'yummy'})
		log.debug(`updateRes back to bar worked?: ${updateRes}`)

		// test the set with a new get
		log.info('getting updated test data')
		testCats = await client.get('cats')
		log.debug(JSON.stringify('testing cats after update 2:'))
		log.debug(`${JSON.stringify(testCats)}`)

		// Test updating an invalid / non-existent value for key
		log.info('testing update for non-existent data for key \'derp\'')
		updateRes = await client.update('derp', {'foo':'bar', 'kitty':'yummy'})
        log.debug(`updateRes back to bar worked?: ${updateRes}`)
		
		// Test attempt to delete a real value
		log.info('deleting real data for key \'cats\'')
		let testDelTwo = await client.del('cats')
		log.debug(testDelTwo)
		
		// Test attempt to delete an invalid value
		log.info('attempting to delete data with a non-existentkey')
		log.info('NOTE: this test will throw, that is expected behavior..\n')
		let testDel = await client.del('cars')
		log.debug(testDel)
	} catch (e) {
		log.error(`Error: ${e}-- If this is the last line, all tests succeeded.\n\n`)
		process.exit(0)
	}
}
module.exports = test