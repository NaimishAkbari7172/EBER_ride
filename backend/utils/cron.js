
const createrideModel = require("../models/createride_model");
const cron= require("node-cron")
const settingModel = require('../models/setting_model');
const mongoose = require("mongoose")
const driverModel = require("../models/driver_model")
let notificationCounter = 0;
// ---------------------------Timeout handle task--------------------------------------------//

async function fetchConfig() {
    const fetchRideTimeOut = await settingModel.findOne().select('rideTimeouts -_id');
    return fetchRideTimeOut.rideTimeouts ? parseInt(fetchRideTimeOut.rideTimeouts, 10) : null;
}
// console.log("/......")
async function myTask() {
    // console.log(">1<")
    
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
                    // console.log("??????????????????????????????????????????", `${resulttimeout} >= ${RideTimeOut}`, resulttimeout >= RideTimeOut);
                    
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

                        global.io.emit('runningrequestreject', drivernewdata, ridenewdata);

                        global.io.emit("timeoutdata", {
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
                    // console.log(pendingdrivertoassign.length + "::::::::::")

                    if (pendingdrivertoassign.length > 0) {
                    
                        const randomIndex = Math.floor(Math.random() * pendingdrivertoassign.length);
                        const randomdriver = pendingdrivertoassign[randomIndex];
                        // console.log(randomIndex + " }{}{}{}{}{{}{{}{}{}{}{{}{")
                        // console.log(randomdriver + " }{}{}{}{}{{}{{}{}{}{}{{}{")

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
                        global.io.emit("pushnotification", {
                            // message: notificationMessage,
                            notificationCounter
                        });

                        global.io.emit("whendriverisnearest", { success: true, olddriver, newdriver, finalresult });
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


                            global.io.emit('crontimeoutdata', finalresult)
                            //kaam baaki che add krvanu
                            console.log("00000000000")


                        } else {
                            console.log("912 END");

                            const finalresult = await createrideModel.findByIdAndUpdate(data._id, { $set: { nearest: false, ridestatus: 0 }, $unset: { driverId: "", nearestArray: "", assigningTime: "" } }, { new: true });

                            global.io.emit('crontimeoutdata', finalresult)
                            console.log("11111111")

                            notificationCounter++;

                            const notificationMessage = 'Sorry Ride Timeout! Driver Not Found Try Again';
                            global.io.emit("pushnotification", {
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
const job = cron.schedule("* * * * * *", async () => {
    // console.log(">1<")
    await myTask();
}, {timezone:"Asia/Kolkata"});

module.exports = job;