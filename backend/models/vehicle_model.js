const mongoose = require('mongoose');

const vehicleSchema = mongoose.Schema({
    vehicleName: {
        type: String,
        unique: true,
        required: true
    },
    vehicleImage: {
        type: String,
        required: true,
        unique: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
});

const vehicleModel= mongoose.model('Vehicle', vehicleSchema);
module.exports= vehicleModel;