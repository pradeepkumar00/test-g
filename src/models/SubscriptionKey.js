const mongoose = require("mongoose");

const subscriptionKeySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deviceKey: {
      type: String,
      required: [true, "Device key is required"],
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiry time is required"],
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

subscriptionKeySchema.methods.isValid = function () {
  return !this.isRevoked && new Date() < this.expiresAt;
};

module.exports = mongoose.model("SubscriptionKey", subscriptionKeySchema);
