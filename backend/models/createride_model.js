const mongoose = require('mongoose');

const Status = {
    PENDING: 0,
    ASSIGNING: 1,
    REJECTED: 2,
    CANCELLED: 3,
    ACCEPTED: 4,
    ARRIVED: 5,
    STARTED: 6,
    COMPLETED: 7,
    HOLD: 8,
    PICKED: 9,
};

const createrideSchema = mongoose.Schema({
        paymentOption: {},
        rideTime: {},
        serviceType: {},
        rideDate: {},
        time: {},
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "vehicles",
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "users",
        },
        cityId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "cities",
        },
        startLocation: {},
        endLocation: {},
        wayPoints: {},
        totalDistance: {},
        totalTime: {},
        estimateTime: {},
        estimateFare: {},
        driverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "drivers",
        },
        ridestatus: {
            type: Number,
            enum: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            default: 0,
        },
        assigningTime: {
            type: Number
        },

        nearest: {
            type: Boolean,
            default: false,
        },
        nearestArray: {
            type: Array
        },
        feedback: {
            type: String
        },
    },
    {
        timestamps: true,
    },
);

const createrideModel= mongoose.model('Createride', createrideSchema);
module.exports= createrideModel;