const express = require('express');
const vehicleRotes = express.Router();
const vehicleModel = require('../models/vehicle_model');
const path = require('path')
const multer = require("multer")
const authenticateToken = require('../middleware/jwtAuthenticate')

const uploadMiddleware = require("../middleware/uploadfile");
const validateId = require('../middleware/validateId');
const img_path = path.join(__dirname, "../public/vehicle");
const upload = uploadMiddleware(img_path);


//......................................... routes for add vehicle.....................................................
vehicleRotes.post("/vehicle", authenticateToken, async (req, res, next) => {
    upload.single('vehicleImage')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({ success: false, message: "File size exceeds the limit (2MB)." });
            }
            return res.status(400).json({ success: false, message: "Unexpected error while uploading the file." });
        } else if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        next();
    });
}, async (req, res) => {
    const { vehicleName } = req.body;
    if (!vehicleName) {
        res.status(400).send({ success: false, message: "vehicleName not found" })
    }

    try {
        let vehicle
        if (!req.file) {
            vehicle = new vehicleModel({
                vehicleName: vehicleName
            });
        } else {
            // const vehicleImage = req.file.filename;
            vehicle = new vehicleModel({
                vehicleName: vehicleName,
                vehicleImage: req.file.filename
            });
        }
        await vehicle.save();
        res.json({ success: true, message: "Vehicle Added Successfully", vehicle });

    } catch (err) {
        console.log(err);

        if (err.keyPattern) {
            return res.status(500).json({ success: false, message: "Vehicle Already Exists" });
        }
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
});

//........................................ Get vehicle Data..................................
vehicleRotes.get('/vehicledata', authenticateToken, async (req, res) => {
    try {
        const data = await vehicleModel.find({});
        if(!data.length){
            return res.status(404).json({ succes:false, message:"Vehicle data not found"})
        }
        res.status(200).json({success:true, message:"Vehicle data found", data })
    } catch (err) {
        console.log(err);
        res.status(500).json({ succes: false, message: "Something went wrong" });
    }
})


// .....................................update vehicle data.................................
vehicleRotes.put('/updateVehicle/:id', authenticateToken, validateId, async (req, res, next) => {
    upload.single('vehicleImage')(req, res, function (err) {
        // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({ success: false, message: "File size exceeds the limit (2MB)." });
            }
            return res.status(400).json({ success: false, message: "Unexpected error while uploading the file." });
        } else if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
        next();
    });
}, async (req, res) => {
    try {
        const vehicleId = req.params.id;

        const existingVehicle = await vehicleModel.findOne({
            vehicleName: req.body.vehicleName,
            _id: { $ne: vehicleId } // Exclude the current vehicle being updated
        });

        if (existingVehicle) {
            return res.status(400).json({ success: false, message: "Vehicle name is already in use." });
        }

        let vehicle;

        if (!req.file) {
            vehicle = await vehicleModel.findByIdAndUpdate(vehicleId, {
                vehicleName: req.body.vehicleName,
            }, { new: true })
        } else {
            vehicle = await vehicleModel.findByIdAndUpdate(vehicleId, {
                vehicleName: req.body.vehicleName,
                vehicleImage: req.file.filename
            }, { new: true })
        }

        res.json({ success: true, message: "Vehicle Updated Successfully", vehicle });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
});


module.exports = vehicleRotes;