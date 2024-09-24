const express= require('express');
const createrideRoutes= express.Router();
const createrideModel= require('../models/createride_model');
const authenticateToken = require('../middleware/jwtAuthenticate')


const Status = {
    PENDING: 0,
    ASSIGNING: 1,
    REJECTED: 2,
    CANCELLED: 3,
    ACCEPTED: 4,
    ARRIVED: 5,
    PICKED: 9,
    STARTED: 6,
    COMPLETED: 7,
    HOLD: 8
  };

// CREATERIDE POST REQUEST---------------------------------------
createrideRoutes.post('/addride', authenticateToken, async(req, res)=> {
    console.log(req.body);
    try{
        const ride= new createrideModel(req.body);
        await ride.save();
        res.status(200).send(ride);
    }catch(e){
        console.log(e);
        res.status(500).send(e)
    }
})

module.exports= createrideRoutes;