const mongoose = require('mongoose');

const settingSchema = mongoose.Schema({
    rideTimeouts: {
        type: Number
    },

    stopCounts: { 
        type: Number
    },
    EMAIL_USER: {},
    EMAIL_PASSWORD: {},
    accountSid: {},
    authToken: {},
    twilioPhoneNumber: {},
    STRIPE_Secret_key: {},
    STRIPE_Publishable_key: {}

})

const settingModel= mongoose.model('Setting', settingSchema)
module.exports= settingModel