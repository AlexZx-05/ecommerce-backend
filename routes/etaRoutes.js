const express = require("express");
const axios = require("axios");
const Order = require("../models/Order");
const router = express.Router();

router.get("/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate("address");

    // 🔍 DEBUG — this tells us if address is really attached
    console.log("ORDER ADDRESS:", order.address);

    if (!order || !order.address || !order.address.location) {
      return res.status(400).json({ msg: "Address or location missing" });
    }

    const origin = `${order.trackingLocation.lat},${order.trackingLocation.lng}`;
    const destination = `${order.address.location.lat},${order.address.location.lng}`;

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${process.env.GOOGLE_MAPS_KEY}`;

    const response = await axios.get(url);

    console.log("GOOGLE RESPONSE:", JSON.stringify(response.data, null, 2));

    const element = response.data.rows[0].elements[0];

    if (element.status !== "OK") {
      return res.status(400).json({ msg: "Google could not calculate route" });
    }

    res.json({
      distance: element.distance.text,
      eta: element.duration.text
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "ETA calculation failed" });
  }
});

module.exports = router;
