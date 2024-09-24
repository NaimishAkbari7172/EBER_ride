const express = require("express");
const userRoutes = express.Router();
const userModel = require("../models/user_model");
const path = require("path");
const mongoose = require("mongoose");
const authenticateToken = require("../middleware/jwtAuthenticate");

const uploadMiddleware = require("../middleware/uploadfile");
const validateId = require("../middleware/validateId");
const user_path = path.join(__dirname, "../public/user");
const upload = uploadMiddleware(user_path);
const errorHandler = require("../middleware/multerErrorHandler");
const { resolveObjectURL } = require("buffer");
const stripe = require("stripe")(
  "sk_test_51PVRDa06N1UTHog99UQBlNEtNeR0kG589zjK9Kf4jqPUIxSUpoN1hQCYPufsHhmLzMakarir4KnJW0dVseN4miib00EzDjBR6z"
);

// .......................................User Add................................................
userRoutes.post(
  "/user",
  authenticateToken,
  upload.single("profile"),
  errorHandler,
  async (req, res) => {
    const { username, useremail, countrycode, userphone } = req.body;
    if (!username) {
      return res
        .status(400)
        .send({ success: false, message: "username not found" });
    }
    if (!useremail) {
      return res
        .status(400)
        .send({ success: false, message: "useremail not found" });
    }
    if (!countrycode) {
      return res
        .status(400)
        .send({ success: false, message: "countrycode not found" });
    }
    if (!userphone) {
      return res
        .status(400)
        .send({ success: false, message: "userphone not found" });
    }

    if (userEmail) {
    }

    try {
      let newUser;
      if (!req.file) {
        newUser = new userModel({
          username: username,
          useremail: useremail,
          countrycode: countrycode,
          userphone: userphone,
        });
      } else {
        newUser = new userModel({
          profile: req.file.filename,
          username: username,
          useremail: useremail,
          countrycode: countrycode,
          userphone: userphone,
        });
      }

      await newUser.save();
      console.log("newUser============", newUser);

      res
        .status(201)
        .json({ success: true, message: "User Added Successfully", newUser });
    } catch (error) {
      if (error.keyPattern) {
        console.log(error);
        return res.status(500).json({
          success: false,
          message: "User Already Exists",
          error: error.message,
        });
      }
      res.status(500).json({ success: false, message: "Something went wrong" });
    }
  }
);

// .................................update user details........................................
userRoutes.put(
  "/userupdate/:id",
  authenticateToken,
  validateId,
  upload.single("profile"),
  errorHandler,
  async (req, res) => {
    const {
      updateusername,
      updateuseremail,
      updatecountrycode,
      updateuserphone,
    } = req.body;

    try {
      const userId = req.params.id;
      // console.log(userId)

      // Check if the email or phone number already exists for another user
      const existingUserByEmail = await userModel.findOne({
        useremail: updateuseremail,
        _id: { $ne: userId },
      });
      if (existingUserByEmail) {
        return res.status(400).json({
          success: false,
          message: "Email is already in use by another user.",
        });
      }

      const existingUserByPhone = await userModel.findOne({
        userphone: updateuserphone,
        _id: { $ne: userId },
      });
      if (existingUserByPhone) {
        return res.status(400).json({
          success: false,
          message: "Phone number is already in use by another user.",
        });
      }

      let updatedUser;

      if (!req.file) {
        const user = {
          username: req.body.updateusername,
          useremail: req.body.updateuseremail,
          countrycode: req.body.updatecountrycode,
          userphone: req.body.updateuserphone,
        };
        updatedUser = await userModel.findByIdAndUpdate(userId, user, {
          new: true,
        });
      } else {
        console.log(req.file.filename);
        const user = {
          profile: req.file.filename,
          username: updateusername,
          useremail: updateuseremail,
          countrycode: updatecountrycode,
          userphone: updateuserphone,
        };
        updatedUser = await userModel.findByIdAndUpdate(userId, user, {
          new: true,
        });
      }

      if (!updatedUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      res.json({
        success: true,
        message: "User Updated Successfully",
        updatedUser,
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, message: "User Already Exists" });
    }
  }
);

// .................................delete user............................................
userRoutes.delete(
  "/userdelete/:id",
  authenticateToken,
  validateId,
  async (req, res) => {
    try {
      const userId = req.params.id;
      const deleteuser = await userModel.findByIdAndDelete(userId);

      if (!deleteuser) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json({ success: true, message: "User Deleted Successfully" });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ success: false, message: "Something went wrong" });
    }
  }
);

// ...................................get user data, search, pagination, sort................
userRoutes.get("/userdata", async (req, res) => {
  let page = +req.query.page || 1;
  let limit = +req.query.limit || 5;
  let search = req.query.search;
  let sortBy = req.query.sortBy || "username";
  let sortOrder = req.query.sortOrder;
  let skip = page > 0 ? (page - 1) * limit : 0;

  // Ensure the page is at least 1
  if (page < 1) {
    page = 1;
  }
  skip = (page - 1) * limit;
  try {
    let query = {};

    if (search) {
      query = {
        $or: [
          { username: { $regex: search, $options: "i" } },
          { useremail: { $regex: search, $options: "i" } },
          { userphone: { $regex: search, $options: "i" } },
        ],
      };
    }

    const count = await userModel.find(query).count();
    let totalPage = Math.ceil(count / limit);

    if (page > totalPage) {
      page = totalPage;
      skip = page > 0 ? (page - 1) * limit : 0;
    }

    let sortCriteria = {};

    if (sortBy === "name") {
      sortCriteria = { username: sortOrder === "asc" ? 1 : -1 };
    } else if (sortBy === "email") {
      sortCriteria = { useremail: sortOrder === "asc" ? 1 : -1 };
    } else if (sortBy === "phone") {
      sortCriteria = { userphone: sortOrder === "asc" ? 1 : -1 };
    }

    let userdata = await userModel
      .find(query)
      .limit(limit)
      .skip(skip)
      .sort(sortCriteria);
    if (!userdata.length) {
      return res
        .status(400)
        .json({ success: false, message: "User Data not found" });
    }

    res.json({
      success: true,
      message: "Data Found",
      userdata,
      page,
      limit,
      totalPage,
      count,
    });
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
});

// ...............................get userdata by phone number..................................
userRoutes.post("/userdata/number", authenticateToken, async (req, res) => {
  const { countrycode, userphone } = req.body;
  // console.log(req.body);
  try {
    const user = await userModel.findOne(req.body);
    if (!user) {
      return res.status(404).send({ message: "No user found" });
    }
    console.log(user);
    res.status(200).json({ success: true, message: "User found", user });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something went wrong", error });
  }
});

// ............................add credit card.......................................
userRoutes.post("/addcard/:id", async (req, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);
    console.log(id);
    const user = await userModel.findById(id);
    console.log(user.username);

    if (!user.customer_id) {
      const customer = await stripe.customers.create({
        name: user.username,
        email: user.useremail,
      });

      user.customer_id = customer.id;
      await user.save();
    }
    console.log(user.customer_id);
    console.log("330", req.body.token);

    const card = await stripe.customers.createSource(user.customer_id, {
      source: `${req.body.token.id}`,
    });

    console.log("334", card);
    res.status(200).json({
      success: true,
      message: "Customer ID Generated Successfully",
      card,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message });
  }
});

//------------------------------------------GET CARD STRIPE-----------------------------------------//
userRoutes.get("/getcard/:id", async (req, res) => {
  console.log("hii");
  // console.log(req.params.id);
  try {
    const id = req.params.id;
    const user = await userModel.findById(id);
    console.log(user);
    if (!user.customer_id) {
      console.log("User does not have a Stripe customer ID");
      return res.status(400).json({
        success: true,
        message: "User does not have a Stripe customer ID",
      });
    }
    const customer = await stripe.customers.retrieve(user.customer_id);
    console.log("354", customer);
    const defaultCardId = customer.default_source;

    console.log("363", defaultCardId);

    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.customer_id,
      type: "card",
    });

    const paymentMethodsData = paymentMethods.data.map((card) => ({
      ...card,
      isdefalut: card.id == defaultCardId,
    }));
    console.log("374", paymentMethodsData);

    res.status(200).json({ success: true, paymentMethodsData });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Failed to retrieve card details",
      error: error.message,
    });
  }
});

//------------------------------------------DELETE CARD STRIPE-----------------------------------------//
userRoutes.delete("/deletecard/:id", async (req, res) => {
  try {
    const deletedCard = await stripe.paymentMethods.detach(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Card Deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error });
  }
});

//------------------------------------------UPDATE CARD STRIPE-----------------------------------------//
userRoutes.patch("/setdefaultcard/:customerId", async (req, res) => {
  try {
    const cardId = req.body.cardId;
    const customerId = req.params.customerId;
    console.log(cardId);
    await stripe.customers.update(customerId, {
      default_source: cardId,
    });

    res.status(200).json({ message: "Default card set successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to set default card" });
  }
});

// -------------------------------------PAYMENT PROCESS----------------------------------------//
userRoutes.post("/payment/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(req.params.id + ">>>>>>>>>>>>>");
    let { amount } = req.body;
    let amountInUsd = amount / 80;

    // Convert amount to integer and to smallest currency unit (cents for USD)
    amountInCent = Math.round(amountInUsd * 100);

    const user = await userModel.findById(userId);
    if (!user || !user.customer_id) {
      return res.status(400).json({
        success: false,
        message: "User does not have a Stripe customer ID",
      });
    }

    const customer = await stripe.customers.retrieve(user.customer_id);
    console.log(customer);
    console.log(amount);
    const defaultCardId = customer.default_source;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCent, // amount in cents
      description: " ::: for testing :::",
      currency: "usd",
      customer: user.customer_id,
      payment_method: defaultCardId,
      off_session: true,
      confirm: true,
    });

    res.status(200).json({ success: true, paymentIntent });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Payment failed",
      error: error.message,
    });
  }
});

module.exports = userRoutes;
