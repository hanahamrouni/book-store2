const express = require("express");
const User = require("./user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET_KEY;

router.post("/admin", async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await User.findOne({ username });
    if (!admin) {
      res.status(404).send({ message: "Admin not found!" });
    }

    // if(admin.password !== password) {
    //     res.status(401).send({message: "Invalid password!"})
    // }

    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Authentication successful",
      token: token,
      user: {
        username: admin.username,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Failed to login as admin", error);
    res.status(401).send({ message: "Failed to login as admin" });
  }
});

router.post("/register", async (req, res) => {
  const { password, email, uid } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).send({ message: "User already exists!" });
    }
    const newUser = await User.create({ ...req.body, role: "user" });
    res
      .status(201)
      .send({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Failed to register user", error);
    res.status(500).send({ message: "Failed to register user" });
  }
});

module.exports = router;
