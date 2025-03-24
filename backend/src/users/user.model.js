const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  uid: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    required: true,
  },
  bookHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
    },
  ],
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
