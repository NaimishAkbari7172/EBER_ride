const express = require("express");
const updateRoutes = express.Router();
const AdminModel = require("../models/admin_model");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const validateId = require("../middleware/validateId");

updateRoutes.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

//  API to update data of user in database using Angular form.
updateRoutes.put("/update/:id", validateId, async (req, res) => {
  try {
    const { adminName, email, password } = req.body;
    const userId = req.params.id;

    // Check if the user is authenticated using session data
    if (!req.session.token) {
      return res.status(401).json({ message: "Unauthorized Access" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // console.log(userId)
    const updateUser = await AdminModel.findByIdAndUpdate(userId, {
      adminName: adminName,
      email: email,
      password: hashedPassword, // Hashing the password
    });

    if (!updateUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "User Updated Successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

module.exports = updateRoutes;
