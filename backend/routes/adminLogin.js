const express = require("express");
const loginRoutes = express.Router();
const AdminModel = require("../models/admin_model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const session = require("express-session");

loginRoutes.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

loginRoutes.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await AdminModel.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ message: "Invalid username" });
    }

    const isPassEqual = await bcrypt.compare(password, user.password);
    if (!isPassEqual) {
      return res.status(401).json({ message: "Password doesn't match" });
    }

    const tokenObj = {
      _id: user._id,
      email: user.email,
    };

    //when User Authentication successful.
    // Generating a JWT token
    const jwtToken = jwt.sign(tokenObj, process.env.SECRET, {
      expiresIn: "20m",
    });

    // Store token in session
    req.session.token = jwtToken;

    return res.status(200).json({ jwtToken, tokenObj });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong", err });
  }
});

module.exports = loginRoutes;
