const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 24 * 60 * 60 * 1000,
  path: "/",
};

exports.register = async (req, res) => {
  try {
    const {firstName, lastName, email, password, confirmPassword, phoneNo} =
      req.body;
    const existingUser = await User.findOne({email});
    if (existingUser) {
      return res.status(400).json({message: "Email already registered"});
    }
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phoneNo,
    });
    user.password = undefined;
    res.status(201).json({
      message: "Registration successful",
      user,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({message: errors.join(", ")});
    }
    console.error(err);
    res.status(500).json({message: "Server error"});
  }
};

exports.login = async (req, res) => {
  try {
    const {email, password} = req.body;
    const user = await User.findOne({email}).select("+password");
    if (!user) {
      return res.status(400).json({message: "User not found"});
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).send("Invalid Password");

    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("access_token", token, cookieOptions);
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({message: "Server error"});
  }
};

exports.checkUserExists = async (req, res) => {
  try {
    const {email} = req.query;
    if (!email) {
      return res
        .status(400)
        .json({message: "Email query parameter is required"});
    }

    const user = await User.findOne({email: email.toLowerCase().trim()});
    return res.json({exists: !!user});
  } catch (err) {
    console.error(err);
    res.status(500).json({message: "Server error"});
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const {email, password} = req.body;
    if (!email || !password) {
      return res.status(400).json({message: "Email and password are required"});
    }

    const user = await User.findOne({email: email.toLowerCase().trim()});
    if (!user) {
      return res.status(404).json({message: "User not found"});
    }

    user.password = password;
    user.confirmPassword = password;
    await user.save();

    res.status(200).json({message: "Password reset successfully"});
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({message: errors.join(", ")});
    }
    console.error(err);
    res.status(500).json({message: "Server error"});
  }
};

exports.logout = async (req, res) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
  res.status(200).json({message: "Logged out successfully"});
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({error: "User not found"});
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "Server error"});
  }
};

exports.updateUser = async (req, res) => {
  try {
    const allowed = ["firstName", "lastName", "email", "phoneNo"];
    const updateData = {};

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {$set: updateData},
      {
        returnDocument: "after",
        runValidators: false,
        select: "-password -confirmPassword",
      },
    );

    if (!updatedUser) {
      return res.status(404).json({error: "User not found"});
    }
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "Server error"});
  }
};
