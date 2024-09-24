const mongoose = require('mongoose');

const countrySchema = mongoose.Schema({
    countryName: {
        type: String,
        unique: true,
        required: true,
    },
    countryTimeZone: {
        type: String,
    },
    countryCode: {
        type: String,
    },
    countryCurrency: {
        type: String,
    },
    flagImage: {
        type: String,
    }
})

const countryModel= mongoose.model('Country', countrySchema);

module.exports = countryModel