const express = require('express');
const cityRoutes = express.Router();
const cityModel = require('../models/city_model');
const validateId = require('../middleware/validateId');
const authenticateToken = require('../middleware/jwtAuthenticate')

// .............................................Post city data.................................
cityRoutes.post("/city", authenticateToken, async (req, res) => {
    try {
        const {
            countryId,
            city,
            coordinates
        } = req.body;
        
        // Check for required fields
        if (!countryId) {
            return res.status(400).json({ success: false, message: "countryId is required" });
        }

        if (!city) {
            return res.status(400).json({ success: false, message: "city is required" });
        }

        if (!coordinates) {
            return res.status(400).json({ success: false, message: "coordinates is required" });
        }

        const model = new cityModel({
            countryId: countryId,
            city: city,
            coordinates: coordinates
        });

        const data = await model.save();
        res.status(201).send({
            success: true,
            message: "City Added Successfully",
            data,
        });

    } catch (err) {
        console.log(err);

        if (err.keyPattern) {
            if (err.keyPattern.city) {
                // console.log("Country Already Exists")
                return res.status(403).json({
                    success: false,
                    message: "City Already Exists"
                });
            }
        };

        if (err.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: "Validation Error", details: err.errors });
        }

        res.status(500).json({ success: false, message:  "Something went wrong" });
    }
});


// --------------------------------GET CITY DATA WITH PAGINATION-----------------------------------//
cityRoutes.get("/city", authenticateToken, async (req, res) => {
    let page = +req.query.page || 1;
    let limit = +req.query.limit || 5;
    let skip = (page > 0 ? ((page - 1) * limit) : 0);
    

    try {

        const count = await cityModel.find().count();
        if (count === 0) {
            return res.status(404).json({ success: false, message: "No cities found" });
        }

        let totalPage = Math.ceil(count / limit);


        if (page > totalPage) {
            page = totalPage;
            skip = (page - 1) * limit;
        }

        const aggregatePipeline = [
            {
                $lookup: {
                    from: 'countries',
                    foreignField: '_id',
                    localField: 'countryId',
                    as: 'countryDetails'
                }
            },

            { $unwind: "$countryDetails" },
            { $sort: {city:1 } },
            { $skip: skip },
            { $limit: limit },
        ];

        const citydata = await cityModel.aggregate(aggregatePipeline);

        if(!citydata.length){
            return res.status(404).send({message:"City Data not found"})
        }

        res.json({
            success: true,
            message: "City Data Found",
            citydata,
            page,
            limit,
            totalPage,
            count,
        });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
});



//  API to update data of city in database using Angular form.
cityRoutes.put('/cityupdate/:id', authenticateToken, validateId,  async (req, res) => {
    try {
        const { city, coordinates } =req.body;

        // Check for required fields
        if (!city) {
            return res.status(400).json({ success: false, message: "city is required" });
        }

        if (!coordinates) {
            return res.status(400).json({ success: false, message: "coordinates is required" });
        }

        const cityId = req.params.id;

        const updatedCity = {
            city: city,
            coordinates: coordinates
        };
        // console.log(updatedCity)

        let cityData = await cityModel.findByIdAndUpdate(cityId, updatedCity, { new: true });

        if(!cityData){
            res.status(404).send({ success: false, message:"City not found"})
        }   
        
        res.json({ success: true, message: "City Updated Successfully", cityData });

    } catch (err) {
        console.log(err);

        if (err.keyPattern) {
            if (err.keyPattern.city) {
                return res.status(403).json({
                    success: false,
                    message: "City Already Exists"
                });
            }
        }

        res.status(500).json({ success: false, message: "Something went wrong!", err });
    }
});


//----------------------------API TO FETCH ALL ZONES OF A COUNTRY-------------------------------//
cityRoutes.get("/coordinates/:countryid", authenticateToken, async (req, res) => {
    try {
        const id = req.params.countryid;
        // console.log(id)
        if(!id){
            return res.status(400).send({success: false, message:"Country Id not found"})
        }
        
        const citydata = await cityModel.find({ countryId: id })
        // console.log(citydata)
        if(!citydata.length){
            return res.status(404).send({success: false, message:"No cities found for this country'"})
        }

        // console.log(citydata)
        return res.status(200).json({ success: true, citydata});
    } catch (err) {
        // res.status(400).send(err.message.split(":")[2]);
        return res.status(500).json({ success: false, message: 'Internal Server Error'});
    }
});



module.exports = cityRoutes;

