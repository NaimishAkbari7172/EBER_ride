const express = require('express');
const countryRoutes = express.Router();
const countryModel = require('../models/country_model');
const authenticateToken = require('../middleware/jwtAuthenticate')


//................................country routes to register country data.........................

countryRoutes.post('/country', authenticateToken, async (req, res) => {
    try {
        console.log(req.body.countryName)
        // new instance of country
        const country = new countryModel(req.body);
        await country.save();
        res.status(201).json({ message: 'country added successfully', country });
    } catch (error) {
        if (error.code === 11000) {
            // Duplicate key error
            return res.status(500).json({ success: false, message: "Country Already Exists" });
        } else {
            res.status(500).json({ success: false, message: error });
        }
    }
})

countryRoutes.get("/countrydata", authenticateToken, async (req, res) => {
    try {
        const countrydata = await countryModel.find({});
        // console.log(countrydata[0].countryName)
        res.status(200).json({ success:true, countrydata });
    } catch (err) {
        console.log(err);
        res.status(500).json({message: "Something went wrong"});
    }
});

// .....................................country search api..................................
countryRoutes.get('/countrysearch', authenticateToken, async (req, res) => {
    let search = req.query.search;
    // console.log(search)
    try {
        let query = {};

        if (search) {
            query = {
                $or: [{ countryName: { $regex: search, $options: "i" } }],
            };
        }
        let countrydata = await countryModel.find(query);
        if(!countrydata){
            return res.status(400).json({success: false, message: "Country data not found"})
        }

        res.json({
            success: true,
            message: "Data Found",
            countrydata,
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = countryRoutes