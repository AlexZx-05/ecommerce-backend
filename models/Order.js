const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },
      name: String,
      price: Number,
      quantity: Number
    }
  ],

  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: true
  },

  totalAmount: {
    type: Number,
    required: true
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },

 orderStatus: {
  type: String,
  enum: [
    "placed",
    "packed",
    "shipped",
    "picked",
    "on-the-way",
    "delivered",
    "cancelled"
  ],
  default: "placed"
},


  assignedDeliveryBoy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
