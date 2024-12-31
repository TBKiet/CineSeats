const express = require("express");
const router = express.Router();
const showtimeController = require("./showtime.controller");

router.get("/", showtimeController.getShowtimesJson);
module.exports = router;