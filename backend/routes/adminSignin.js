const express = require("express");
const registerRoutes = express.Router();
const AdminModel = require("../models/admin_model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("dotenv").config();
const session = require("express-session");

const { sendWelcomeEmail } = require("../utils/nodemailer");

registerRoutes.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

registerRoutes.post("/register", async (req, res) => {
  const { adminName, email, password } = req.body;

  if (!adminName) {
    return res
      .status(404)
      .json({ success: false, message: "adminName is required" });
  }

  if (!email) {
    return res
      .status(404)
      .json({ success: false, message: "email is required" });
  }

  if (!password) {
    return res
      .status(404)
      .json({ success: false, message: "password is required" });
  }

  try {
    // chech user is already exist or not.................................................
    const existingUser = await AdminModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email is already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new AdminModel({
      adminName: adminName,
      email: email,
      password: hashedPassword,
    });

    await newUser.save().then(() => {
      const tokenObj = {
        email: newUser.email,
      };

      // Generate a JWT token
      const jwtToken = jwt.sign(tokenObj, process.env.SECRET, {
        expiresIn: "20m",
      });

      // Store token in session
      req.session.token = jwtToken;

      console.log("Registration jwt Token :", jwtToken);

      // send sms to the user for successful registration
      sendWelcomeEmail(email);
      return res
        .status(201)
        .json({ message: "Account has been created", jwtToken });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error", err });
  }
});

module.exports = registerRoutes;
