const express = require('express');
const driverApiRoutes = express.Router();

const driverModel = require('../models/driver_model');
const createrideModel = require('../models/createride_model');


driverApiRoutes.post('/driver-status/:id', async (req, res) => {
    const driverId = req.params.id;
    console.log(driverId)

    try {
        // Check if the driver exists and their assign field is set to 1
        const driver = await driverModel.findById(driverId);
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        if (driver.assign !== '1') {
            return res.status(400).json({ message: 'Driver is not assigned' });
        }

        // Find the createride reference for the driver
        const ride = await createrideModel.findOne({ driverId });
        console.log(ride)
        if (!ride) {
            return res.status(404).json({ message: 'Ride not found for the driver' });
        }

        // Check the ridestatus value
        let statusMessage = '';
        switch (ride.rideStatus) {
            case 4:
                statusMessage = 'Driver started moving to user';
                break;
            case 5:
                statusMessage = 'Driver arrived';
                break;
            case 6:
                statusMessage = 'Driver started trip';
                break;
            case 7:
                statusMessage = 'Driver ended trip';
                break;
            default:
                statusMessage = 'Unknown status';
        }
        console.log(statusMessage)

        return res.status(200).json({ message: statusMessage });


    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = driverApiRoutes