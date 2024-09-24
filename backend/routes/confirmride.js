
const express = require("express");
const confirmrideRoutes = new express.Router();
const createRideModel = require("../models/createride_model");
const mongoose = require("mongoose");
const authenticateToken = require('../middleware/jwtAuthenticate')

// ------------------------------GET RIDE DATA-----------------------------------------//
confirmrideRoutes.get('/ridedata', authenticateToken, async (req, res) => {

    let page = +req.query.page || 1;
    let limit = +req.query.limit || 5;
    let skip = (page > 0 ? ((page - 1) * limit) : 0);
    try {
        const count = await createRideModel.find().count();
        let totalPage = Math.ceil(count / limit);

        if (page > totalPage) {
            page = totalPage;
            skip = (page - 1) * limit;
        }

        const aggregationPipeline = [

            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails",
                },
            },
            { $unwind: "$userDetails" },
            {
                $lookup: {
                    from: "cities",
                    localField: "cityId",
                    foreignField: "_id",
                    as: "cityDetails",
                },
            },
            { $unwind: "$cityDetails" },
            {
                $lookup: {
                    from: "countries",
                    localField: "cityDetails.countryId",
                    foreignField: "_id",
                    as: "countryDetails",
                },
            },
            { $unwind: "$countryDetails" },
            {
                $lookup: {
                    from: "vehicles",
                    localField: "serviceId",
                    foreignField: "_id",
                    as: "vehicleDetails",
                },
            },
            { $unwind: "$vehicleDetails" },
            {
                $lookup: {
                    from: "drivers",
                    localField: "driverId",
                    foreignField: "_id",
                    as: "driverDetails",
                },
            },
            {
                $unwind: {
                    path: "$driverDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $sort: { createdAt: -1 } // Sorting by 'createdAt' field in descending order
            },
            {
                $facet: {
                    rides: [
                        // { $sort: 1},
                        { $skip: skip },
                        { $limit: limit },
                    ],
                    totalCount: [{ $count: "count" }],
                }
            }
        ];

        const result = await createRideModel.aggregate(aggregationPipeline).exec();
        if(!result.length){
            return res.status(404).send({message: "Data not found"})
        }

        const rides = result[0]?.rides || [];
        
        const totalCount = result[0]?.totalCount[0]?.count || 0;
        const totalPages = Math.ceil(totalCount / limit);
        
        if (page > totalPages) {
            page = totalPages;
            skip = (page - 1) * limit;
        }

        // console.log(totalPages, totalCount)
        
        res.status(200).json({ rides, page, limit, totalPages, totalCount });
        
    } catch (error) {
        res.status(500).json({message:"Something went wrong",error})
    }
})

// --------------------------------------------GET CONFIRM-RIDE DATA---------------------------------------------//
confirmrideRoutes.post("/ridesinfo", authenticateToken, async (req, res) => {
    try {

        let page = +req.body.page || 1;
        let limit = +req.body.limit || 5;
        let search = req.body.search;
        let statusfilter = +req.body.statusfilter;
        let vehiclefilter = req.body.vehiclefilter;
        let sortOrder = req.body.sortOrder || "desc";
        let skip = (page - 1) * limit;

        console.log(req.body);

        const matchStage = {};
        if (search) {
            var searchObjectId;

            if (search.length == 24) {
                searchObjectId = new mongoose.Types.ObjectId(search);
            }

            matchStage.$or = [
                { "userDetails.username": { $regex: search, $options: "i" } },
                { "userDetails.userphone": { $regex: search, $options: "i" } },
                { _id: searchObjectId },
                { rideDate: { $regex: search, $options: "i" } },
            ];
        }

        const matchCriteria = [];

        if (statusfilter !== -1) {
            matchCriteria.push({ ridestatus: { $in: [statusfilter] } });
        } else if (statusfilter === -1) {
            matchCriteria.push({ ridestatus: { $nin: [3, 7] } });
        }

        console.log(matchCriteria, ",,,,,,,")

        if (vehiclefilter && vehiclefilter.length > 0) {
            matchCriteria.push({ serviceType: { $in: [vehiclefilter] } });
        }

        if (matchCriteria.length === 0) {
            matchCriteria.push({});
        }


        let sortCriteria = {};

        if (sortOrder === "desc") {
            sortCriteria = { createdAt: -1 };
        } else {
            sortCriteria = { createdAt: 1 };
        }
        // console.log(sortCriteria);

        const aggregationPipeline = [
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails",
                },
            },
            { $unwind: "$userDetails" },
            {
                $lookup: {
                    from: "cities",
                    localField: "cityId",
                    foreignField: "_id",
                    as: "cityDetails",
                },
            },
            { $unwind: "$cityDetails" },
            {
                $lookup: {
                    from: "countries",
                    localField: "cityDetails.countryId",
                    foreignField: "_id",
                    as: "countryDetails",
                },
            },
            { $unwind: "$countryDetails" },
            {
                $lookup: {
                    from: "vehicles",
                    localField: "serviceId",
                    foreignField: "_id",
                    as: "vehicleDetails",
                },
            },
            { $unwind: "$vehicleDetails" },
            {
                $lookup: {
                    from: "drivers",
                    localField: "driverId",
                    foreignField: "_id",
                    as: "driverDetails",
                },
            },
            {
                $unwind: {
                    path: "$driverDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            // { $match: matchStage },
            {
                $match: {
                    $and: [...matchCriteria, matchStage],
                },
            },

            {
                $facet: {
                    rides: [
                        { $sort: sortCriteria },
                        { $skip: skip },
                        { $limit: limit },
                        // { $project: { _id: 0 } },
                    ],
                    totalCount: [{ $count: "count" }],
                },
            },
        ];

        const result = await createRideModel.aggregate(aggregationPipeline).exec();
        const rides = result[0]?.rides || [];
        // console.log(rides)

        const totalCount = result[0]?.totalCount[0]?.count || 0;
        const totalPages = Math.ceil(totalCount / limit);

        if (page > totalPages) {
            page = totalPages;
            skip = (page - 1) * limit;
        }

        res.send({ rides, page, limit, totalPages, totalCount });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

module.exports = confirmrideRoutes;
