const express = require('express');
const driverRoutes = express.Router();
const driverModel = require('../models/driver_model');
const path = require('path');
const authenticateToken = require('../middleware/jwtAuthenticate')

const uploadMiddleware = require("../middleware/uploadfile");
const validateId = require('../middleware/validateId');
const profile_path = path.join(__dirname, "../public/user");
const upload= uploadMiddleware(profile_path);
const errorHandler= require("../middleware/multerErrorHandler")


// .......................................Add new Driver............................................

driverRoutes.post('/adddriver', authenticateToken, upload.single("profile"), errorHandler, async (req, res) => {
        const { drivername, driveremail, countrycode, driverphone, city } = req.body;
        if(!drivername){
            res.status(400).json({ success:false, message:"drivername not found"})
        }
        if(!driveremail){
            res.status(400).json({ success:false, message:"driveremail not found"})
        }
        if(!countrycode){
            res.status(400).json({ success:false, message:"countrycode not found"})
        }
        if(!driverphone){
            res.status(400).json({ success:false, message:"driverphone not found"})
        }
        if(!city){
            res.status(400).json({ success:false, message:"city not found"})
        }

        try {
            let newDriver;
            if (!req.file) {
                newDriver = new driverModel({
                    drivername: drivername,
                    driveremail: driveremail,
                    countrycode: countrycode,
                    driverphone: driverphone,
                    city: city,
                });
            } else {
                const profile = req.file.filename;
                // console.log(profile);
                newDriver = new driverModel({
                    profile: profile,
                    drivername: drivername,
                    driveremail: driveremail,
                    countrycode: countrycode,
                    driverphone: driverphone,
                    city: city,
                });
            }

            const driverdata = await newDriver.save();
            // console.log(newDriver);
            res.status(201).json({
                success: true,
                message: "Driver Added Successfully",
                driverdata,
            });
        } catch (error) {
            console.log(error);
            if (error.keyPattern) {
                return res
                    .status(500)
                    .json({ success: false, message: "Driver Already Exists" });
            }
            res.status(500).json({ success: false, message: "Something went wrong", error });
        }
    }
);


// ...............................Get Driver Data, Search, Pagination, Sort...............................

driverRoutes.get("/driverdata", authenticateToken, async (req, res) => {
    let page = +req.query.page || 1;
    let limit = +req.query.limit || 5;
    let search = req.query.search;
    let sortBy = req.query.sortBy || "name";
    let sortOrder = req.query.sortOrder || "desc";
    let skip = (page > 0 ? ((page - 1) * limit) : 0);
    // console.log("sortBy", sortBy, "sortOrder", sortOrder)
    try {
        let query = {};

        if (search) {
            query = {
                $or: [
                    { drivername: { $regex: search, $options: "i" } },
                    { driveremail: { $regex: search, $options: "i" } },
                    { driverphone: { $regex: search, $options: "i" } },
                ],
            };
        }

        const count = await driverModel.find(query).count();
        let totalPage = Math.ceil(count / limit);

        if (page > totalPage) {
            page = totalPage;
            skip = (page>0 ? ((page - 1) * limit) : 0);
        }

        let sortCriteria = {};

        if (sortBy === "name") {
            sortCriteria = { drivername: sortOrder === "asc" ? 1 : -1 };
        } else if (sortBy === "email") {
            sortCriteria = { driveremail: sortOrder === "asc" ? 1 : -1 };
        } else if (sortBy === "phone") {
            sortCriteria = { driverphone: sortOrder === "asc" ? 1 : -1 };
        } else {
            sortCriteria = { drivername: sortOrder === "asc" ? 1 : -1 };

        }

        const aggregatePipeline = [
            {
                $lookup: {
                    from: "cities",
                    localField: "city",
                    foreignField: "_id",
                    as: "cityDetails",
                }
            },
            {
                $lookup: {
                    from: "vehicles",
                    localField: "servicetype",
                    foreignField: "_id",
                    as: "serviceDetails",
                }
            },

            { $unwind: "$cityDetails" },
            {
                $unwind: {
                    path: "$serviceDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            { $match: query },
            { $sort: sortCriteria },
            { $skip: skip },
            { $limit: limit },
        ];

        const driverdata = await driverModel.aggregate(aggregatePipeline);
        if(!driverdata.length){
            return res.status(404).status({ message: "Driver data not found"})
        }

        res.json({
            success: true,
            message: "Data Found",
            driverdata,
            page,
            limit,
            totalPage,
            count,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Something went wrong" })
    }
});


// ..................................Delete Driver..............................................
driverRoutes.delete('/driverdata/:id', authenticateToken, validateId, async (req, res) => {
    try {
        const driverId = req.params.id;
        console.log(driverId)

        const deletedDriver = await driverModel.findByIdAndDelete(driverId);
        if (!deletedDriver) {
            return res.status(404).json({ message: "Driver not found" });
        }
        return res.json({ success: true, message: "Driver Deleted Successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
});


// .....................................Update Driver..............................................

driverRoutes.put("/updatedriver/:id", authenticateToken, validateId, upload.single("profile"), errorHandler , async (req, res) => {

    const { drivername, driveremail, countrycode, driverphone, city } = req.body;

    try {
        const driverId = req.params.id;
        // console.log(driverId);
        let updatedDriver;

        if (!req.file) {
            const data = {
                drivername: drivername,
                driveremail: driveremail,
                countrycode: countrycode,
                driverphone: driverphone,
                city: city,
            };
            updatedDriver = await driverModel.findByIdAndUpdate(driverId, data, { new: true });
        }
        else {
            // console.log(req.file.filename);
            const driver = {
                profile: req.file.filename,
                drivername: drivername,
                driveremail: driveremail,
                countrycode: countrycode,
                driverphone: driverphone,
                city: city,
            };
            updatedDriver = await driverModel.findByIdAndUpdate(driverId, driver, { new: true });
        }

        res.status(200).json({
            success: true,
            message: "Driver Updated Successfully",
            updatedDriver,
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: "Driver Already Exists" });
    }
}
);

//---------------------------------------------------------- ADD OR UPDATE SERVICE---------------------------------------------------

driverRoutes.post('/service/:id', authenticateToken,  validateId , async (req, res) => {
    const { servicetype } = req.body;

    try {
        const driverId = req.params.id;

        const data = { servicetype: servicetype }

        const existingService= await driverModel.findByIdAndUpdate(driverId, data, { new: true });

        
        if(!existingService){
            return res.status(404).send("Service type not found")
        }
        // console.log(existingService)
        res.json({ success: true, message: 'Service Updated Successfully', existingService });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Failed to add or update service' });
    }
});

module.exports = driverRoutes;