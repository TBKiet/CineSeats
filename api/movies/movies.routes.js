const express = require("express");
const router = express.Router();
const movieController = require("./movies.controller");

// Routes for rendering pages
router.get("/", movieController.getMoviesJson);
router.get("/showing", movieController.getMoviesJson);
router.get("/upcoming", movieController.getMoviesJson);
router.get("/:id", movieController.getMovieByID);
module.exports = router;