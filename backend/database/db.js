const mongoose= require('mongoose');
require('dotenv').config({path:"./.env"});

const url= process.env.MONGO_URL;

mongoose.connect(url)
    .then(()=> {
        console.log("Database connected.......")
    }).catch((err)=>{
        console.log("Error while connect with MongoDB :" , err);
    })