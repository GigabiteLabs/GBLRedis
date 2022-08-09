const assert = require('assert')
var should = require('chai').should()

async function objectsEqual(source, comparison) {
    // get types
    const sourceType = typeof(source)
    const comparisonObject = typeof(comparison)

    // both must be objects
    sourceType.should.equal('object')
    sourceType.should.equal('object')

    const sourceKeys = Object.keys(source)
    const comparisonKeys = Object.keys(comparison)

    for(key in comparisonKeys) {
      // get key for check
      const checkKey = comparisonKeys[key]
       // each should have same keys
      assert(sourceKeys.includes(comparisonKeys[key]) == true)
      // the values for evey key should also be the same
      source[checkKey].should.equal(comparison[checkKey])
    }
}

function timeout(seconds) {
    return new Promise(resolve => {
        setTimeout(resolve, seconds);
    });
}

module.exports = { objectsEqual, timeout }