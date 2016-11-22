const Insight = require('insight')
const pkg = require('../package')

module.exports = new Insight({
    // Google Analytics tracking code
    trackingCode: 'UA-54857209-9',
    pkg
})
