const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  name: String,
  phone: String,
  addressLine: String,
  city: String,
  state: String,
  pincode: String,
  landmark: String,

  // Required for ETA & Maps
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  }

}, { timestamps: true });

module.exports = mongoose.model("Address", addressSchema);
