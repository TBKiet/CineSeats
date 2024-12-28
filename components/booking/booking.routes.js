const express = require("express");
const router = express.Router();
const bookingController = require("./booking.controller");

// Routes for rendering pages
router.post("/:movieId", bookingController.renderSeatSelection);
module.exports = router;