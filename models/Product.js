const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    default: 0
  },
  image: {
    type: String,   // later we will store image URL / Cloudinary link
    default: ""
  }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
