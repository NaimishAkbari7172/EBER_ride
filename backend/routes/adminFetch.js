const express = require("express");
const fetchRoutes = express.Router() 
const AdminModel = require("../models/admin_model");               //required signup data model or schema from model.js file
const authenticated = require("../middleware/authenticated");      //required authentication middleware from auth.js file which is a custom middleware file


fetchRoutes.get('/fetch',authenticated ,async(req,res)=> {
    try{
        const user= await AdminModel.find({}, {password: 0});

        if(!user){
            return res.status(400).json({ success:false, message: 'User Data not found' })
        }

        return res.status(200).json({token:req.user, user})
    }catch(err){
        console.log(err)
        return res.status(500).json({ message: 'Something went wrong', err })
    }
})


module.exports = fetchRoutes
