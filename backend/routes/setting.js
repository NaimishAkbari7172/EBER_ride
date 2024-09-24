const express = require('express');
const settingRoutes = express.Router();
const settingModel = require('../models/setting_model');
const path = require("path")
const authenticateToken = require('../middleware/jwtAuthenticate')

// require('dotenv').config({ path: "./.env" });
require('dotenv').config({ path: "../.env" });

const fs = require('fs');

initializeConfig = async () => {
    try {
        const config = await settingModel.findOne();

        if (!config) {
            const setting = new settingModel({
                rideTimeouts: parseInt(process.env.RIDE_TIMEOUTS),
                stopCounts: parseInt(process.env.STOP_COUNTS)
            });
            const saved = await setting.save();
            // console.log(saved)
            console.log('Initial configuration saved to database.');
        } else {
            console.log("RideTimeOut & StopCounts data already there");
        }
    } catch (err) {
        console.log(err)
    }
}

// --------------------------------------------GET SETTING DATA API---------------------------------------------//
settingRoutes.get('/settingdata', authenticateToken, async (req, res) => {
    initializeConfig();
    try {
        const settings = await settingModel.findOne();
        res.status(200).json(settings);
    } catch (err) {
        res.status(500).send(err);
    }
});


// --------------------------------------------UPDATE SETTING DATA API---------------------------------------------//
settingRoutes.post('/updatesetting', authenticateToken, async (req, res) => {
    try {

        console.log("68", req.body);
        const stopCounts = +req.body.settingdata.stopCounts
        const rideTimeouts = +req.body.settingdata.rideTimeouts
        const EMAIL_USER = req.body.settingdata.EMAIL_USER
        const EMAIL_PASSWORD = req.body.settingdata.EMAIL_PASSWORD
        const accountSid = req.body.settingdata.accountSid
        const authToken = req.body.settingdata.authToken
        const twilioPhoneNumber = req.body.settingdata.twilioPhoneNumber
        const STRIPE_Publishable_key = req.body.settingdata.STRIPE_Publishable_key
        const STRIPE_Secret_key = req.body.settingdata.STRIPE_Secret_key

        data = {
            rideTimeouts: rideTimeouts,
            stopCounts: stopCounts,
            EMAIL_USER: EMAIL_USER,
            EMAIL_PASSWORD: EMAIL_PASSWORD,
            accountSid: accountSid,
            authToken: authToken,
            twilioPhoneNumber: twilioPhoneNumber,
            STRIPE_Publishable_key: STRIPE_Publishable_key,
            STRIPE_Secret_key: STRIPE_Secret_key
        }
        

        let settingdata = await settingModel.findByIdAndUpdate("66757b1261d654a1303906a4" ,data, { new: true });

        console.log(settingdata+ ";;;;;")

        // Update .env file
        const envFilePath = path.resolve(__dirname, '../.env');
        // console.log(envFilePath)
        if (fs.existsSync(envFilePath)) {

            const existingEnvFile = fs.readFileSync(envFilePath, 'utf-8');
            // console.log('Existing .env content:', existingEnvFile);

            const updatedEnvFile = existingEnvFile
                .replace(/RIDE_TIMEOUTS=\d+/, `RIDE_TIMEOUTS=${rideTimeouts}`)
                .replace(/STOP_COUNTS=\d+/, `STOP_COUNTS=${stopCounts}`)
                .replace(/EMAIL_USER=.*/, `EMAIL_USER=${EMAIL_USER}`)
                .replace(/EMAIL_PASSWORD=.*/, `EMAIL_PASSWORD=${EMAIL_PASSWORD}`)
                .replace(/ACCOUNT_SID=.*/, `ACCOUNT_SID=${accountSid}`)
                .replace(/AUTH_TOKEN=.*/, `AUTH_TOKEN=${authToken}`)
                .replace(/TWILIO_PHONE_NUMBER=.*/, `TWILIO_PHONE_NUMBER=${twilioPhoneNumber}`)
                .replace(/STRIPE_PUBLISHABLE_KEY=.*/, `STRIPE_Publishable_key=${STRIPE_Publishable_key}`)
                .replace(/STRIPE_SECRET_KEY=.*/, `STRIPE_Secret_key=${STRIPE_Secret_key}`);
            fs.writeFileSync(envFilePath, updatedEnvFile);
            

        } else {
            console.error(`.env file does not exist at: ${envFilePath}`);
            throw new Error('.env file not found');
        }

        return res.json({ success: true, message: "Data updated successfully", settingdata });

    } catch (err) {
        res.status(500).send({ success: false, message: "Something went wrong", error: err.message });
    }
});
module.exports = settingRoutes;
