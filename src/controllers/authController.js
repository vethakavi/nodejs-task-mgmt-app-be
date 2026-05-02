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
  const {name, email, password} = req.body;
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({name, email, password: hash});
  res.json(user);
};

exports.login = async (req, res) => {
  try {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if (!user) {
      return res.status(400).json({message: "User not found"});
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).send("Invalid Password");

    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("access_token", token, cookieOptions);
    const {password: _, ...userWithoutPassword} = user.toObject();
    res.status(200).json({user: userWithoutPassword});
  } catch (err) {
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
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({error: "User not found"});
    }

    const allowed = ["name", "email", "phone", "bio"];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        user[key] = req.body[key];
      }
    }

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "Server error"});
  }
};
