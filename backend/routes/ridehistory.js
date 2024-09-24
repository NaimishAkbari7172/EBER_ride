const express = require('express');
const ridehistoryRoutes = express.Router()
const createrideModel = require('../models/createride_model')
const authenticateToken = require('../middleware/jwtAuthenticate')



// ------------------------------------------------DOWNLAOD DATA IN CSV FROM RIDE-HISTORY TABLE-----------------------------------------------//
ridehistoryRoutes.post("/downloadridehistory", authenticateToken, async (req, res) => {

    let paymentFilter = req.body.alldataatonce.payment;
    let fromdate = req.body.alldataatonce.fromdate;
    let todate = req.body.alldataatonce.todate;
    let startLocationSearch = req.body.alldataatonce.startlocationsearch;
    let endLocationSearch = req.body.alldataatonce.endlocationsearch;
    let statusfilter = +req.body.alldataatonce.status;

    console.log(req.body);

    try {

        const matchStage = {};

        if (statusfilter !== -1) {
            matchStage.ridestatus = { $in: [statusfilter] };
        } else if (statusfilter === -1) {
            matchStage.ridestatus = { $nin: [0, 1, 2, 4, 5, 6, 9, 8] };
        }

        if (paymentFilter !== "") {
            matchStage.paymentOption = paymentFilter;
        }

        if (startLocationSearch && endLocationSearch) {
            matchStage.startLocation = { $regex: startLocationSearch, $options: "i" };
            matchStage.endLocation = { $regex: endLocationSearch, $options: "i" };
        } else if (startLocationSearch) {
            matchStage.startLocation = { $regex: startLocationSearch, $options: "i" };
        } else if (endLocationSearch) {
            matchStage.endLocation = { $regex: endLocationSearch, $options: "i" };
        }

        if (fromdate && todate) {
            matchStage.rideDate = {
                $gte: fromdate,
                $lte: todate,
            };
        }

        // console.log(matchStage)

        const aggregationPipeline = [

            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                $unwind: "$userDetails"
            },
            {
                $lookup: {
                    from: 'cities',
                    localField: 'cityId',
                    foreignField: '_id',
                    as: 'cityDetails'
                }
            },
            {
                $unwind: "$cityDetails"
            },
            {
                $lookup: {
                    from: 'countries',
                    localField: 'cityDetails.countryId',
                    foreignField: '_id',
                    as: 'countryDetails'
                }
            },
            {
                $unwind: "$countryDetails"
            },
            {
                $lookup: {
                    from: 'vehicles',
                    localField: 'serviceId',
                    foreignField: '_id',
                    as: 'vehicleDetails'
                }
            },
            {
                $unwind: "$vehicleDetails"
            },
            {
                $lookup: {
                    from: "drivers",
                    localField: "driverId",
                    foreignField: "_id",
                    as: "driverDetails"
                }
            },
            {
                $unwind: {
                    path: "$driverDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $sort: { createdAt: 1 } // Sorting by 'createdAt' field in descending order
            },
            {
                $match: {
                    $and: [{ ridestatus: { $in: [3, 7] } }, matchStage]
                },
            },
        ];

        const myridehistory = await createrideModel.aggregate(aggregationPipeline).exec()
        // console.log(myridehistory);

        res.status(200).send({ success: true, message: "Ride History Data Found", myridehistory });

    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: "Ride History Data Not Found", error: error.message });
    }
});


module.exports = ridehistoryRoutes;