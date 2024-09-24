const mongoose = require('mongoose');

const validateId = (req, res, next) => {
    const userId= req.params.id;
    if(!mongoose.Types.ObjectId.isValid(userId)){
        return res.status(400).json({message: "Invalid User ID"});;
    }
    next();
}

module.exports= validateId;