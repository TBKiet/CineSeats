const express = require("express");
const router = express.Router();
const showtimeController = require("./showtime.controller");

router.get("/", showtimeController.getShowtimesJson);
router.get("/:showtimeId", showtimeController.getShowtimeByIdJson);
module.exports = router;