let log = require('../client/utilities/logger.js')('redisTests.js')

async function test(client) {
	try {
		// Seed initial data
		log.info('seeding test data')
		client.testSetGet()

		// Test get
		log.info('getting seeded data')
		let test = await client.get('test')
		if(test){
			log.info('attempt to get object by key passed.\n\n')
		}else{
			log.info('attempt to get object failed by returning a null value!.\n\n')
		}

		// test set4
		log.info('setting test data for key \'cats\'')
		let setRes = await client.set('cats',test)
		if(setRes){
			log.info('attempt to set object by key value passed.\n\n')
		}else{
			log.info('attempt to set object by key / value failed returning a null value!.\n\n')
		}

		// test the set with a new get
		log.info('getting test data for key \'cats\'')
		let testCats = await client.get('cats')
		if(testCats){
			log.info('attempt to get object by key passed.\n\n')
		}else{
			log.info('attempt to get object failed by returning a null value!.\n\n')
		}

		// Test updating the value of the obj for cats
		log.info('updating test data for key \'cats\' with new values for current key \'foo\', and new key \'kitty\'')
		let updateRes = await client.update('cats', {'foo':'fanny', 'kitty':'yummy'})
		log.debug(`updateRes: ${updateRes}`)

		// test the set with a new get
		log.info('getting the updated test data for key \'cats\'')
		testCats = await client.get('cats')
		if(testCats){
			log.info('attempt to get object by key passed.\n\n')
		}else{
			log.info('attempt to get object failed by returning a null value!.\n\n')
		}
		
		// Test updating the value of the obj for cats
		log.info('updating test data for key \'cats\', resetting value of key \'foo\' to value \'bar\'')
		updateRes = await client.update('cats', {'foo':'bar', 'kitty':'yummy'})
		if(updateRes){
			log.info('attempt to update non-existent object by key passed.\n\n')
		}else{
			log.info('attempt to update non-existent object failed by returning a value!.\n\n')
		}

		// test the set with a new get
		log.info('getting updated test data')
		testCats = await client.get('cats')
		if(testCats){
			log.info('attempt to get object by key passed.\n\n')
		}else{
			log.info('attempt to get object failed by returning a null value!.\n\n')
		}

		// Test updating an invalid / non-existent value for key
		log.info('testing update for non-existent data for key \'derp\'')
		updateRes = await client.update('derp', {'foo':'bar', 'kitty':'yummy'})
		if(!updateRes){
			log.info('attempt to update non-existent object by key passed by returning null value.\n\n')
		}else{
			log.info('attempt to update non-existent object failed by returning a value!.\n\n')
		}
		
		// Test attempt to delete a real value
		log.info('deleting real data for key \'cats\'')
		let testDelTwo = await client.del('cats')
		if (!testDelTwo){
			log.info('attempt to delete non-existent object passed by returning null value.\n\n')
		}else{
			log.info('attempt to delete non-existent object failed by returning a value!.\n\n')
		}
		
		// Test attempt to delete an invalid value
		log.info('attempting to delete data with a non-existentkey')
		let testDel = await client.del('cars')
		if (!testDel){
			log.info('attempt to delete non-existent object passed by returning null value.\n\n')
		}else{
			log.info('attempt to delete non-existent object failed by returning a value!.\n\n')
		}

		log.info('cleaning up remaining test data')
		let clean = await client.del('test')
		if (clean){
			log.info('attempt to clean test data was successful.\n\nAll tests pass!\n\n')
			process.exit(0)
		}else{
			log.info('attempt to clean test data was NOT successful, returned a null value!.\n\n')
			process.exit(0)
		}
	} catch (e) {
		log.error(`Error: ${e}\n\n`)
		process.exit(1)
	}
}

module.exports = test