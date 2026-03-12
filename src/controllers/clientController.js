const SubscriptionKey = require("../models/SubscriptionKey");

const login = async (req, res) => {
  try {
    const { key, deviceKey } = req.body;

    if (!key || !deviceKey) {
      return res.status(400).json({ success: false, message: "key and deviceKey are required" });
    }

    const subscription = await SubscriptionKey.findOne({ key }).populate("userId", "name email");

    if (!subscription) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: "Subscription key not found",
      });
    }

    if (subscription.deviceKey !== deviceKey) {
      return res.status(403).json({
        success: false,
        valid: false,
        message: "Device key does not match this subscription",
      });
    }

    if (subscription.isRevoked) {
      return res.status(403).json({
        success: false,
        valid: false,
        message: "Subscription key has been revoked",
      });
    }

    if (new Date() >= subscription.expiresAt) {
      return res.status(403).json({
        success: false,
        valid: false,
        message: "Subscription key has expired",
        expiredAt: subscription.expiresAt,
      });
    }

    res.json({
      success: true,
      valid: true,
      message: "Subscription is active",
      data: {
        key: subscription.key,
        deviceKey: subscription.deviceKey,
        expiresAt: subscription.expiresAt,
        user: subscription.userId,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { login };
