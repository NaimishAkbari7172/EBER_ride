const { Server } = require('socket.io');
require("dotenv").config({path: '../.env'});

const mongoose = require("mongoose");
const driverModel = require("../models/driver_model");
const createrideModel = require("../models/createride_model");
const userModel = require('../models/user_model');

const settingmodel = require('../models/setting_model')
const {CronJob}= require("cron")

const {sendRideStatus} = require("./nodemailer");
const {sendInvoiceEmail} = require("./nodemailer");
const settingModel = require('../models/setting_model');

let notificationCounter = 0;

// const stripe = require('stripe')(process.env.STRIPE_Secret_key)


async function initSocket(server) {
// console.log(",..,.,.,.,.,.,.,.,.,.,.,.,.,.sssssssssss,.,.,")
    const io = new Server(server, { cors: { origin: ["http://localhost:4200", "http://127.0.0.1:8081", "http://192.168.32.241:8080"] } });
    // const io = new Server(server, { cors: { origin: ["http://127.0.0.1:8081"] } });

    global.io = io;
    io.on("connection", (socket) => {
        console.log("Socket is Running.");

    //--------------------------------------------------------DRIVER STATUS UPDATE --------------------------------------------------------//
    socket.on("driverstatus", async (data) => {
        const { driverId, status } = data;

        try {
            await driverModel.findByIdAndUpdate(
                driverId,
                { status },
                { new: true }
            );

            const aggregationPipeline = [
                {
                    $lookup: {
                        from: "cities",
                        localField: "city",
                        foreignField: "_id",
                        as: "cityDetails",
                    },
                },
                {
                    $unwind: "$cityDetails",
                },
                {
                    $lookup: {
                        from: "vehicles",
                        localField: "servicetype",
                        foreignField: "_id",
                        as: "serviceDetails",
                    },
                },
                {
                    $unwind: {
                        path: "$serviceDetails",
                        preserveNullAndEmptyArrays: true,
                    },
                },
            ]

            const data = await driverModel.aggregate(aggregationPipeline).exec();

            io.emit("statusdata", {
                success: true,
                data,
                message: "Driver Status Updated Successfully.",
            });
        } catch (error) {
            io.emit("statusdata", { success: false, message: error });
        }
    });

    //------------------------------------------------SHOW DRIVER DATA OF PARTICULAR CITY AND SERVICE ,STATUS TRUE------------------------------------//
    socket.on("showdriverdata", async (data) => {
        // console.log("70:::::::::::::::::::",data);

        try {
            const cityId = new mongoose.Types.ObjectId(data.cityId);
            const serviceId = new mongoose.Types.ObjectId(data.serviceId);
            // console.log(data.cityId, serviceId);

            const aggregationPipeline = [
                {
                    $lookup: {
                        from: "cities",
                        localField: "city",
                        foreignField: "_id",
                        as: "cityDetails",
                    },
                },
                {
                    $unwind: "$cityDetails",
                },
                {
                    $lookup: {
                        from: "vehicles",
                        localField: "servicetype",
                        foreignField: "_id",
                        as: "serviceDetails",
                    },
                },
                {
                    $unwind: {
                        path: "$serviceDetails",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $match: {
                        city: cityId,
                        servicetype: serviceId,
                        status: true,
                        assign: "0",
                    },
                },
            ];
            const driverdata = await driverModel
                .aggregate(aggregationPipeline)
                .exec();
            // console.log( "113 driverdataresponse", driverdata);

            io.emit("availabledriverdata", driverdata, {
                success: true,
                message: "Driver Data Patched in Assign Dialog Box",
                driverdata,
            });
        } catch (error) {
            console.log(error);
            io.emit("availabledriverdata", {
                success: false,
                message: "Driver Data Not Patched in Assign Dialog Box",
                error: error.message,
            });
        }
    });

     //--------------------------------------------------------DRIVER SERVICE TYPE UPDATE --------------------------------------------------------//
    socket.on("driverService", async (data) => {
        const { driverId, servicetype } = data;
        // console.log(data);

        try {
            const existingService = await driverModel.findByIdAndUpdate(
                driverId,
                { servicetype },
                { new: true }
            );
            io.emit("servicedata", {
                success: true,
                message: "Service Updated Successfully",
                existingService,
            });
        } catch (error) {
            io.emit("servicedata", { success: false, message: error });
        }
    });

    //------------------------------------------------SHOW DRIVER DATA AFTER ASSIGN-----------------------------------------------//
    socket.on("AssignedData", async (data) => {
        const driverId = data.driverId;
        const rideId = data.rideId;
        // console.log("137", data);
        try {
            const driver = await driverModel.findByIdAndUpdate(
                driverId,
                { assign: "1" },
                { new: true }
            );

            const updatedRide = await createrideModel.findByIdAndUpdate(
                { _id: rideId },
                {
                    $set: { driverId: driverId, ridestatus: 1, assigningTime: Date.now(), nearest: false },
                },
                { new: true }
            );


            const alldata = await createrideModel.aggregate([
                {
                    $match: {
                        _id: updatedRide._id,
                    },
                },
                {
                    $lookup: {
                        from: "drivers",
                        localField: "driverId",
                        foreignField: "_id",
                        as: "driverDetails",
                    },
                },
                {
                    $unwind: "$driverDetails",
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "userDetails",
                    },
                },
                {
                    $unwind: "$userDetails",
                },
                {
                    $lookup: {
                        from: "cities",
                        localField: "cityId",
                        foreignField: "_id",
                        as: "cityDetails",
                    },
                },
                {
                    $unwind: "$cityDetails",
                },
                {
                    $lookup: {
                        from: "countries",
                        localField: "cityDetails.countryId",
                        foreignField: "_id",
                        as: "countryDetails",
                    },
                },
                {
                    $unwind: "$countryDetails",
                },
                {
                    $lookup: {
                        from: "vehicles",
                        localField: "serviceId",
                        foreignField: "_id",
                        as: "vehicleDetails",
                    },
                },
                {
                    $unwind: "$vehicleDetails",
                },
            ]).exec();

            io.emit("newdata", {
                success: true,
                message: "Driver Assigned Successfully.",
                alldata,
            });
        } catch (error) {
            console.log(error);
            io.emit("newdata", {
                success: false,
                message: "Sorry Driver Not Assigned",
                error: error.message,
            });
        }
    });

    // ------------------------------------------------SHOW NEAREST DRIVER ASSIGN-----------------------------------------------//
    socket.on("nearestdata", async (data) => {
        const rideId = data.rideId;
        const cityId = new mongoose.Types.ObjectId(data.cityId);
        const serviceId = new mongoose.Types.ObjectId(data.serviceId);
        // console.log("241", data);
        // console.log(cityId, serviceId);

        try {


            const driverdata = await driverModel.find({ status: true, city: data.cityId, servicetype: data.serviceId, assign: "0" });
            const firstdriver = driverdata
            // console.log("247 firstdriver", firstdriver);

            const driver = await driverModel.findByIdAndUpdate(firstdriver._id, { assign: "1" }, { new: true });
            const ride = await createrideModel.findByIdAndUpdate(rideId, { driverId: firstdriver._id, ridestatus: 1, nearest: true, nearestArray: firstdriver._id, assigningTime: Date.now() }, { new: true })

            const alldata = await createrideModel.aggregate([
                {
                    $match: {
                        _id: rideId,
                    },
                },
                {
                    $lookup: {
                        from: "drivers",
                        localField: "driverId",
                        foreignField: "_id",
                        as: "driverDetails",
                    },
                },
                {
                    $unwind: "$driverDetails",
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "userDetails",
                    },
                },
                {
                    $unwind: "$userDetails",
                },
                {
                    $lookup: {
                        from: "cities",
                        localField: "cityId",
                        foreignField: "_id",
                        as: "cityDetails",
                    },
                },
                {
                    $unwind: "$cityDetails",
                },
                {
                    $lookup: {
                        from: "countries",
                        localField: "cityDetails.countryId",
                        foreignField: "_id",
                        as: "countryDetails",
                    },
                },
                {
                    $unwind: "$countryDetails",
                },
                {
                    $lookup: {
                        from: "vehicles",
                        localField: "serviceId",
                        foreignField: "_id",
                        as: "vehicleDetails",
                    },
                },
                {
                    $unwind: "$vehicleDetails",
                },
            ]);



            io.emit("datanearest", {
                success: true,
                message: "Nearest Driver Assigned Successfully.",
                alldata,
            });
        } catch (error) {
            console.log(error);
            io.emit("datanearest", {
                success: false,
                message: "Sorry Nearest Driver Not Assigned",
                error: error.message,
            });
        }
    });

    // ------------------------------------------------SHOW DRIVER RUNNING-REQUEST TABLE-----------------------------------------------//

    const sendDataToFrontend = async () => {
        try {
            const alldata = await createrideModel.aggregate([
                {
                    $match: {
                        ridestatus: { $in: [1, 4, 5, 9, 6, 7, 8] },
                    },
                },
                {
                    $lookup: {
                        from: "drivers",
                        localField: "driverId",
                        foreignField: "_id",
                        as: "driverDetails",
                    },
                },
                {
                    $unwind: "$driverDetails",
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "userDetails",
                    },
                },
                {
                    $unwind: "$userDetails",
                },
                {
                    $lookup: {
                        from: "cities",
                        localField: "cityId",
                        foreignField: "_id",
                        as: "cityDetails",
                    },
                },
                {
                    $unwind: "$cityDetails",
                },
                {
                    $lookup: {
                        from: "countries",
                        localField: "cityDetails.countryId",
                        foreignField: "_id",
                        as: "countryDetails",
                    },
                },
                {
                    $unwind: "$countryDetails",
                },
                {
                    $lookup: {
                        from: "vehicles",
                        localField: "serviceId",
                        foreignField: "_id",
                        as: "vehicleDetails",
                    },
                },
                {
                    $unwind: "$vehicleDetails",
                },
            ]);

            // console.log(alldata, "+++++++++++++++++++++++++++++++++++++++++++++++++++++++");

            io.emit("runningdata", {
                success: true,
                message: "Running-Request Data",
                alldata,
            });
        } catch (error) {
            console.error(error);
            io.emit("runningdata", {
                success: false,
                message: "Error retrieving data",
                error: error.message,
            });
        }
    }
    socket.on("runningrequest", async () => {
        await sendDataToFrontend();
    });

    //--------------------------------------------RIDE ACCEPTED----------------------------------------------------//
    socket.on('rideaccepted', async (data) => {
        // console.log("612", data);
        const driverId = data.driverId
        const rideId = data.rideId;
        try {
            const ride = await createrideModel.findByIdAndUpdate(rideId, { driverId: driverId, ridestatus: 4 }, { new: true })
            const userdata = await userModel.findById(ride.userId)
            // io.emit('rideupdates', ride);

            if(ride){
                if(notificationCounter>0){
                    notificationCounter--;
                }
                io.emit("pushnotification", {
                    notificationCounter 
                });
            }

            await sendDataToFrontend();
        } catch (error) {
            console.log(error);
        }
    })

    //--------------------------------------------RIDE ARRIVED----------------------------------------------------//
    socket.on('ridearrived', async (data) => {
        // console.log("626", data);
        const rideId = data.rideId;
        try {
            const ride = await createrideModel.findByIdAndUpdate(rideId, { ridestatus: 5 }, { new: true })
            // io.emit('rideupdates', ride);
            await sendDataToFrontend();
        } catch (error) {
            console.log(error);
        }
    })

    //--------------------------------------------RIDE PICKED----------------------------------------------------//
    socket.on('ridepicked', async (data) => {
        // console.log("639", data);

        const rideId = data.rideId;
        try {
            const ride = await createrideModel.findByIdAndUpdate(rideId, { ridestatus: 9 }, { new: true })
            // io.emit('rideupdates', ride);
            await sendDataToFrontend()
        } catch (error) {
            console.log(error);
        }
    })

    //--------------------------------------------RIDE STARTED----------------------------------------------------//
    socket.on('ridestarted', async (data) => {
        // console.log("653", data);

        const rideId = data.rideId;
        try {
            const ride = await createrideModel.findByIdAndUpdate(rideId, { ridestatus: 6 }, { new: true })
            // io.emit('rideupdates', ride);
            await sendDataToFrontend()

        } catch (error) {
            console.log(error);
        }
    })

    //--------------------------------------------RIDE COMPLETED----------------------------------------------------//
    socket.on('ridecompleted', async (data) => {
        const rideId = data.rideId;
        const driverId = data.driverId
        // console.log("474", data);

        try {
            const driverdata = await driverModel.findById(driverId)
            const ridedata = await createrideModel.findByIdAndUpdate(rideId, { $set: { ridestatus: 7 } }, { new: true });
            const userdata = await userModel.findById(ridedata.userId)


            if (!userdata.customer_id) {
                return res.status(400).json({ error: 'User does not have a Stripe customer ID' });
                console.log("User does not have a Stripe customer ID");
                console.log("CASH Payment is Selected");
            }

            // io.emit("rideupdates", ridedata, driverdata);
            await sendDataToFrontend()

            const tripDetails = { ridedata, driverdata, userdata };
            const userEmail = userdata.useremail;

            // console.log("555 + socket :----------------------------")
            sendRideStatus(userEmail, tripDetails);
            sendInvoiceEmail(userEmail, tripDetails)
 

            // let toPhoneNumber = `${driverdata.countrycode}${driverdata.driverphone}`
            let toPhoneNumber = `+91 93167 01144`
            let status = ridedata.ridestatus
            // client.sendRideSMS(toPhoneNumber, status)

        } catch (error) {
            console.log(error);
        }
    })

    //--------------------------------------------FREE DRIVER AFTER RIDE COMPLETE----------------------------------------------------//
    socket.on('driverfree', async (data) => {
        // console.log("526", data);
        const driverId = data.driverId
        const rideId = data.rideId;
        try {
            const driverdata = await driverModel.findByIdAndUpdate(driverId, { $set: { assign: "0" } }, { new: true });
            const ride = await createrideModel.findByIdAndUpdate(rideId, { $unset: { driverId: "", assigningTime: "" } }, { new: true })
            io.emit('rideupdates', ride, driverdata);
            await sendDataToFrontend()
        } catch (error) {
            console.log(error);
        }
    })

    // ------------------------------------------------RIDE REJECTED REQUEST TABLE-----------------------------------------------//
    socket.on("Rejectrunningrequest", async (data) => {

        const driverId = data.driverId
        const rideId = data.rideId

        try {
            const fetchridedata = await createrideModel.findById(rideId);


            const nearestfalsedriver = await driverModel.findByIdAndUpdate(
                { _id: driverId },
                { $set: { assign: "0" } }, { new: true }
            );

            let nearestfalseride;


            if (fetchridedata.nearest == false) {

                nearestfalseride = await createrideModel.findByIdAndUpdate(rideId,
                    { $unset: { driverId: "", assigningTime: "", nearestArray: "" }, 
                    $set: { ridestatus: 2 } }, { new: true }
                );
                io.emit('assignrejected', nearestfalseride, nearestfalsedriver)

            } else {
                
                let newdata = await driverModel.aggregate([
                    {
                        $match: {
                            status: true,
                            city: fetchridedata.cityId,
                            servicetype: fetchridedata.serviceId,
                            assign: "0",
                            _id: { $nin: fetchridedata.nearestArray }
                        },
                    },
                ]);

                if (newdata.length > 0) {

                    await driverModel.findByIdAndUpdate(newdata[0]._id, { $set: { assign: "1" } }, { new: true });

                    await createrideModel.findByIdAndUpdate(
                        data.rideId, 
                        { 
                            $set: { assigningTime: Date.now(), driverId: newdata[0]._id }, 
                            $addToSet: { nearestArray: newdata[0]._id } 
                        },
                        { new: true });

                } else {
                
                    let assigneddriverdata = await driverModel.aggregate([
                        {
                            $match: {
                                status: true,
                                city: fetchridedata.cityId,
                                servicetype: fetchridedata.serviceId,
                                assign: "1",
                                _id: { $nin: fetchridedata.nearestArray }
                            },
                        },
                    ]);
                    console.log(JSON.stringify(assigneddriverdata) + "**********************************")
                    const result = await createrideModel.findByIdAndUpdate(data.rideId, { $set: { assigningTime: Date.now(), ridestatus: 8 }, $unset: { driverId: "" } }, { new: true });
                     
                }
            }
            await sendDataToFrontend();
            
        } catch (error) {
            console.error(error);

        }
    });

    // ------------------------------------------------RIDE CANCEL CONFIRM-RIDE TABLE-----------------------------------------------//
    socket.on("cancelride", async (rideId) => {
        // console.log(rideId);

        try {
            const ridedata = await createrideModel.findByIdAndUpdate(
                { _id: rideId },
                { ridestatus: 3 },
                { new: true }
            );

            io.emit("cancelridedata", {
                success: true,
                message: "Ride Cancelled Successfully",
                ridedata,
            });
        } catch (error) {
            console.error(error);
            io.emit("cancelridedata", {
                success: false,
                message: "Ride Not Cancelled",
                error: error.message,
            });
        }
    });

    // ------------------------------------------------GET DATA in RIDE-HISTORY TABLE-----------------------------------------------//
    socket.on("ridehistory", async (filterdata) => {
        try {
            let page = +filterdata.page || 1;
            let limit = +filterdata.limit || 5;
            let paymentFilter = filterdata.payment;
            let fromdate = filterdata.fromdate;
            let todate = filterdata.todate;
            let startLocationSearch = filterdata.startlocationsearch;
            let endLocationSearch = filterdata.endlocationsearch;
            let statusfilter = +filterdata.status;
            let skip = (page - 1) * limit;

            const matchCriteria = [];

            if (statusfilter !== -1) {
                matchCriteria.push({ ridestatus: { $in: [statusfilter] } });
            } else if (statusfilter === -1) {
                matchCriteria.push({ ridestatus: { $nin: [1, 2, 4, 5, 6] } });
            }

            if (paymentFilter !== "") {
                matchCriteria.push({ paymentOption: paymentFilter });
            }

            if (startLocationSearch || endLocationSearch) {
                const matchStage = {};

                if (startLocationSearch && endLocationSearch) {
                    matchStage.$and = [
                        { startLocation: { $regex: startLocationSearch, $options: "i" } },
                        { endLocation: { $regex: endLocationSearch, $options: "i" } },
                    ];
                } else if (startLocationSearch) {
                    matchStage.startLocation = {
                        $regex: startLocationSearch,
                        $options: "i",
                    };
                } else if (endLocationSearch) {
                    matchStage.endLocation = {
                        $regex: endLocationSearch,
                        $options: "i",
                    };
                }

                matchCriteria.push(matchStage);
            }

            // Date range filter logic
            if (fromdate && todate) {
                matchCriteria.push({
                    rideDate: {
                        $gte: fromdate,
                        $lte: todate,
                    },
                });
            }
            // console.log(matchCriteria);

            if (matchCriteria.length === 0) {
                matchCriteria.push({});
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
                {
                    $unwind: "$userDetails",
                },
                {
                    $lookup: {
                        from: "cities",
                        localField: "cityId",
                        foreignField: "_id",
                        as: "cityDetails",
                    },
                },
                {
                    $unwind: "$cityDetails",
                },
                {
                    $lookup: {
                        from: "countries",
                        localField: "cityDetails.countryId",
                        foreignField: "_id",
                        as: "countryDetails",
                    },
                },
                {
                    $unwind: "$countryDetails",
                },
                {
                    $lookup: {
                        from: "vehicles",
                        localField: "serviceId",
                        foreignField: "_id",
                        as: "vehicleDetails",
                    },
                },
                {
                    $unwind: "$vehicleDetails",
                },
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
                    $match: {
                        $and: [
                            ...matchCriteria,
                            {
                                ridestatus: { $in: [3, 7] },
                            },
                        ],
                    },
                },

                {
                    $facet: {
                        ridehistory: [{ $skip: skip }, { $limit: limit }],
                        totalCount: [{ $count: "count" }],
                    },
                },
            ];

            const ridesdata = await createrideModel
                .aggregate(aggregationPipeline)
                .exec();

            const myridehistory = ridesdata[0]?.ridehistory || [];


            const totalCount = ridesdata[0]?.totalCount[0]?.count || 0;
            const totalPages = Math.ceil(totalCount / limit);

            if (page > totalPages) {
                page = totalPages;
                skip = (page - 1) * limit;
            }

            io.emit("ridehistorydata", {
                success: true,
                message: "Ride History Data Found",
                myridehistory,
                page,
                limit,
                totalPages,
                totalCount,
            });
        } catch (error) {
            console.error(error);
            io.emit("ridehistorydata", {
                success: false,
                message: "Ride History Data Not Found",
                error: error.message,
            });
        }
    });



// ---------------------------Timeout handle task--------------------------------------------//

    async function fetchConfig() {
        const fetchRideTimeOut = await settingModel.findOne().select('rideTimeouts -_id');
        return fetchRideTimeOut.rideTimeouts ? parseInt(fetchRideTimeOut.rideTimeouts, 10) : null;
    }

    async function myTask() {
        
        const RideTimeOut = await fetchConfig();
        // console.log(RideTimeOut + "-------------------------------------------")

        try {
            const asigningrides = await createrideModel.find({ ridestatus: 1, nearest: false });
            const nearestridedata = await createrideModel.find({ $and: [{ $or: [{ ridestatus: 1 }, { ridestatus: 2 }, { ridestatus: 8 }] }, { nearest: true }] });
            // console.log(nearestridedata)

            //----------------For Single Assign Driver----------------------//
            if (asigningrides.length > 0) {
                console.log("Hi if 940");
                for (const data of asigningrides) {
                    if (data.assigningTime) {
                        
                        let currenttime = Date.now();
                        let assignedTime = data.assigningTime;
                        resulttimeout = Math.floor((currenttime - assignedTime) / 1000);
                        console.log("??????????????????????????????????????????", `${resulttimeout} >= ${RideTimeOut}`, resulttimeout >= RideTimeOut);
                        
                        if (resulttimeout >= RideTimeOut) {
                            console.log("success");
                            const drivernewdata = await driverModel.findByIdAndUpdate(
                                data.driverId,
                                { $set: { assign: "0" } }, { new: true }
                            );

                            const ridenewdata = await createrideModel.findByIdAndUpdate(
                                data._id,
                                {
                                    $unset: { driverId: "" },
                                    $set: { ridestatus: 0 },
                                }, { new: true }
                            );

                            io.emit('runningrequestreject', drivernewdata, ridenewdata);

                            io.emit("timeoutdata", {
                                success: true,
                                message: "timeoutdata",
                                ridenewdata,
                                drivernewdata
                            });

                        } else {
                            console.log("failed to get inside single if");
                        }
                    }

                }
            }

            if (nearestridedata.length > 0) {

                for (const data of nearestridedata) {

                    // console.log(">>>>>>>>>>>>>>>>>>>>>>" + data)

                    let currenttime = Date.now()
                    let assignedTime = data.assigningTime
                    resulttimeout = Math.floor((currenttime - assignedTime) / 1000)
                    

                    if (resulttimeout >= RideTimeOut) {
                        // console.log("848", "If");
                        const city_id = new mongoose.Types.ObjectId(data.cityId);
                        const vehicle_id = new mongoose.Types.ObjectId(data.serviceId);
                        const nearestdriversArray = [...new Set(data.nearestArray)];

                        const olddriver = await driverModel.findByIdAndUpdate(data.driverId, { $set: { assign: "0" } }, { new: true });


                        let nonassigndriverdata = driverModel.aggregate([
                            {
                                $match: {
                                    status: true,
                                    city: city_id,
                                    servicetype: vehicle_id,
                                    assign: "0",
                                    _id: { $nin: nearestdriversArray }
                                },
                            },
                        ]);

                        const pendingdrivertoassign = await nonassigndriverdata.exec();
                        console.log(pendingdrivertoassign + "::::::::::")

                        if (pendingdrivertoassign.length > 0) {
                        
                            const randomIndex = Math.floor(Math.random() * pendingdrivertoassign.length);
                            console.log(randomIndex + " }{}{}{}{}{{}{{}{}{}{}{{}{")
                            console.log(randomIndex + " }{}{}{}{}{{}{{}{}{}{}{{}{")
                            const randomdriver = pendingdrivertoassign[randomIndex];

                            const newdriver = await driverModel.findByIdAndUpdate(pendingdrivertoassign[0]._id, { $set: { assign: "1" } }, { new: true });

                            const finalresult = await createrideModel.findByIdAndUpdate(data._id, {
                                $addToSet: { nearestArray: pendingdrivertoassign[0]._id },
                                $set: {
                                    assigningTime: Date.now(),
                                    driverId: pendingdrivertoassign[0]._id,
                                    ridestatus: 1
                                }
                            }, { new: true });

                            notificationCounter++;
                            // let notificationMessage = 'Driver found';
                            io.emit("pushnotification", {
                                // message: notificationMessage,
                                notificationCounter
                            });

                            io.emit("whendriverisnearest", { success: true, olddriver, newdriver, finalresult });
                            //kaam baaki che add krvanu
                        }
                        else {

                            const city_id = new mongoose.Types.ObjectId(data.cityId);
                            const vehicle_id = new mongoose.Types.ObjectId(data.serviceId);

                            let assigndriverdata = driverModel.aggregate([
                                {
                                    $match: {
                                        status: true,
                                        city: city_id,
                                        servicetype: vehicle_id,
                                        assign: "1",
                                        _id: { $nin: nearestdriversArray }
                                    },
                                },
                            ]);

                            const assignedList = await assigndriverdata.exec();

                            if (assignedList.length > 0) {
                                const finalresult = await createrideModel.findByIdAndUpdate(data._id, { $set: { assigningTime: Date.now(), ridestatus: 8 }, $unset: { driverId: "" } }, { new: true });


                                io.emit('crontimeoutdata', finalresult)
                                //kaam baaki che add krvanu
                                console.log("00000000000")


                            } else {
                                console.log("912 END");

                                const finalresult = await createrideModel.findByIdAndUpdate(data._id, { $set: { nearest: false, ridestatus: 0 }, $unset: { driverId: "", nearestArray: "", assigningTime: "" } }, { new: true });

                                io.emit('crontimeoutdata', finalresult)
                                console.log("11111111")

                                notificationCounter++;

                                const notificationMessage = 'Sorry Ride Timeout! Driver Not Found Try Again';
                                io.emit("pushnotification", {
                                    success: true,
                                    message: notificationMessage,
                                    notificationCounter
                                });

                            }

                        }

                    } else {
                        console.log("failed to get inside nearest if");
                    }
                }

            }

        } catch (error) {
            console.error("Error in myTask:", error);
        }
    }


    //----------------------------------------HANDLE CRON------------------------------------------//
    // const job = new CronJob("* * * * * *", async () => {
    //     console.log("1>>>>>>>>>>>>>>>")
    //     const startTime = Date.now();
    //     await myTask();

    //     const executionTime = Date.now() - startTime;
    
    //     // Ensure the task only runs after the 10 seconds have passed
    //     const remainingTime = 10000 - executionTime;
    //     if (remainingTime > 0) {
    //         await new Promise(resolve => setTimeout(resolve, remainingTime));
    //     }
    // },
    // null,
    // true);


    socket.on("disconnect", () => {
        console.log("client Disconnected");
    });
    });
};


module.exports = initSocket;