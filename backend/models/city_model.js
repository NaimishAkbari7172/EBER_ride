const mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

const citySchema= mongoose.Schema({
    countryId:{
        type: ObjectId,
        required:true
    },
    city:{
        type : String,
        unique:true,
        required:true
    },
    coordinates :{
        type: [],
        required:true
    }
});

const cityModel = mongoose.model('City', citySchema);

module.exports= cityModel;