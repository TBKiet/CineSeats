const express = require("express");
const router = express.Router();
const movieController = require("./movies.controller");

// Routes for rendering pages
router.get("/", movieController.renderMovieList);
router.get("/showing", movieController.renderMovieList);
router.get("/upcoming", movieController.renderMovieList);
router.get("/:id", movieController.renderMoviePage);
module.exports = router;