const express = require('express');
const pricingRoutes = express.Router();
const pricingModel = require('../models/pricing_model');
const validateId = require('../middleware/validateId');
const authenticateToken = require('../middleware/jwtAuthenticate')


// .......................................post pricing data...................................

pricingRoutes.post('/pricing', authenticateToken, async (req, res) => {
    const {
        country,
        city,
        service,
        driverprofit,
        minfare,
        distancebaseprice,
        baseprice,
        ppudist,
        pputime,
        maxspace,
    } = req.body;

    try {
        const pricingData = new pricingModel({
            country: country,
            city: city,
            service: service,
            driverprofit: driverprofit,
            minfare: minfare,
            distancebaseprice: distancebaseprice,
            baseprice: baseprice,
            ppudist: ppudist,
            pputime: pputime,
            maxspace: maxspace,
        });

        await pricingData.save();
        console.log(pricingData);
        res.status(201).json({
            success: true,
            message: "Pricing Data Added Successfully",
            pricingData,
        });
    } catch (error) {
        console.log(error);
        if (error.keyPattern) {
            if (error.keyPattern.city && error.keyPattern.service) {
                console.log("Vehicle Already Exists")
                return res.status(500).json({ success: false, message: "Vehicle Already Exists" });
            }
        }
        res.status(500).json({ success: false, message: "Failed to add pricing data", error: error.message });
    }
});


// ........................update pricing data.............................................
pricingRoutes.put("/updatepricing/:id", authenticateToken, validateId, async (req, res) => {
    try {
        const id = req.params.id;
        const {
            country,
            city,
            service,
            driverprofit,
            minfare,
            distancebaseprice,
            baseprice,
            ppudist,
            pputime,
            maxspace,
        } = req.body;

        // Check if the city and service combination already exists
        const existingPricing = await pricingModel.findOne({ _id: { $ne: id }, city, service });

        if (existingPricing) {
            return res.status(400).json({ success: false, message: "Pricing data with this city and service combination already exists." });
        }

        const data = {
            country: country,
            city: city,
            service: service,
            driverprofit: driverprofit,
            minfare: minfare,
            distancebaseprice: distancebaseprice,
            baseprice: baseprice,
            ppudist: ppudist,
            pputime: pputime,
            maxspace: maxspace,
        };

        const updatedPricing = await pricingModel.findByIdAndUpdate(id, data, { new: true });
        if (!updatedPricing) {
            return res.status(404).json({ success: false, message: "Pricing data not found" });
        }
        res.status(200).json({
            success: true,
            message: "Pricing Data Updated Successfully",
            data,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message:"Something went wrong", error: error.message  });
    }
});


// ...................................delete pricing data......................................
pricingRoutes.delete("/deletepricing/:id", authenticateToken, validateId, async (req, res) => {
    try {
        const id = req.params.id;
        const pricingData = await pricingModel.findByIdAndDelete(id);
        // Check if pricingData is null (ID not found)
        if (!pricingData) {
            return res.status(404).json({ success: false, message: "Pricing Data not found" });
        }

        res.status(200).json({
            success: true,
            message: "Pricing Data Deleted Successfully",
            pricingData,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to delete pricing data", error: error.message });
    }
});



// ..................................pagination, search, sort, get data...............................
pricingRoutes.get('/pricingdata', authenticateToken, async (req, res) => {
    let page = +req.query.page || 1;
    let limit = +req.query.limit || 5;
    let skip = (page > 0 ? ((page - 1) * limit) : 0);

    try {
        const count = await pricingModel.find().count();
        let totalPage = Math.ceil(count / limit);

        if (page > totalPage) {
            page = totalPage;
            skip = (page - 1) * limit;
        }

        if (skip < 0) {
            skip = 0;
        }

        // let pricingdata = await pricingModel.find(query).limit(limit).skip(skip).sort({ city : -1, _id: 1 })
        const aggregatePipeline = [
            {
                $lookup: {
                    from: "countries",
                    localField: "country",
                    foreignField: "_id",
                    as: "countryDetails"
                }
            },
            {
                $lookup: {
                    from: "cities",
                    localField: "city",
                    foreignField: "_id",
                    as: "cityDetails"
                }
            },
            {
                $lookup: {
                    from: "vehicles",
                    localField: "service",
                    foreignField: "_id",
                    as: "serviceDetails"
                }
            },

            { $unwind: "$countryDetails" },
            { $unwind: "$cityDetails" },
            { $unwind: "$serviceDetails" },
            // { $match: query },
            { $sort: { createdAt: 1, _id: 1 } },
            { $skip: skip },
            { $limit: limit }
        ];

        const pricingdata = await pricingModel.aggregate(aggregatePipeline);

        res.json({ success: true, message: "Data Found", pricingdata, page, limit, totalPage, count });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to fetch pricing data", error: error.message });
    };
});


// --------------------------------------vehicle data with City ID---------------------------------------//
pricingRoutes.get("/vehicleprice/:id", authenticateToken, validateId, async (req, res) => {
    try {
        const cityId = req.params.id;
        // console.log(cityId)

        // Check if cityId exists in the database
        const isValidCity = await pricingModel.exists({ city: cityId });
        if (!isValidCity) {
            return res.status(404).json({ success: false, message: "City ID not found" });
        }

        const pricingdata = await pricingModel.find({ city: cityId }).populate("service");

        res.status(200).json({ success: true, message: "Pricing Data Found based on City ID", pricingdata });
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error });
    }
});

module.exports = pricingRoutes;
