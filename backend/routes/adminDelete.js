const express = require('express');
const deleteRoutes = express.Router();
const AdminModel = require("../models/admin_model");
const session = require('express-session');
const validateId = require('../middleware/validateId');


deleteRoutes.use(session({
    secret: 'my-session-key',
    resave: false,
    saveUninitialized: true
}));


deleteRoutes.delete('/logindata/:id', validateId , async (req, res) => {
    try {
        const userId = req.params.id;
        // console.log(req.session)

        // Check if the user is authenticated using session data
        if (!req.session.token) {
            console.log("unauthorized")
            return res.status(401).json({ message: 'Unauthorized Access' });
        }

        const deletedUser = await AdminModel.findByIdAndDelete(userId);
        
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
        console.log("User Deleted")

    } catch (err) {
        console.log(err);
        res.status(500).json({ success:false, message: 'Something went wrong', err });
    }
});

module.exports = deleteRoutes;



