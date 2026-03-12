const crypto = require("crypto");
const User = require("../models/User");
const SubscriptionKey = require("../models/SubscriptionKey");

const addUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "name, email, and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User with this email already exists" });
    }

    const user = await User.create({ name, email, password, role: "client" });

    res.status(201).json({
      success: true,
      message: "Client user created successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const generateSubscriptionKey = async (req, res) => {
  try {
    const { userId, deviceKey, durationInDays } = req.body;

    if (!userId || !deviceKey || !durationInDays) {
      return res.status(400).json({
        success: false,
        message: "userId, deviceKey, and durationInDays are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const existingKey = await SubscriptionKey.findOne({
      userId,
      deviceKey,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });
    if (existingKey) {
      return res.status(409).json({
        success: false,
        message: "An active subscription key already exists for this user and device",
        data: existingKey,
      });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + Number(durationInDays));

    const subscriptionKey = await SubscriptionKey.create({
      key: crypto.randomUUID(),
      userId,
      deviceKey,
      expiresAt,
    });

    res.status(201).json({
      success: true,
      message: "Subscription key generated successfully",
      data: subscriptionKey,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const revokeSubscriptionKey = async (req, res) => {
  try {
    const { keyId } = req.params;

    const subscriptionKey = await SubscriptionKey.findByIdAndUpdate(
      keyId,
      { isRevoked: true },
      { new: true }
    );

    if (!subscriptionKey) {
      return res.status(404).json({ success: false, message: "Subscription key not found" });
    }

    res.json({
      success: true,
      message: "Subscription key revoked",
      data: subscriptionKey,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const listUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "client" }).select("-password");
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const listSubscriptionKeys = async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};
    const keys = await SubscriptionKey.find(filter).populate("userId", "name email");
    res.json({ success: true, data: keys });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addUser,
  generateSubscriptionKey,
  revokeSubscriptionKey,
  listUsers,
  listSubscriptionKeys,
};
