const express = require("express");
const router = express.Router();
const { renderAccount, renderDashBoard, renderMovie, deleteUser, blockUser, unblockUser, getFilteredAndSortedUsers, createMovie, getMovieById, updateMovie, deleteMovie, getFilteredAndSortedMovies, getTotalUsersCount, getTotalMoviesCount } = require("./admin.controllers");
const { uploadPoster } = require('../cloudinary/config/cloud');

// Routes for rendering pages
router.get("/dashboard", renderDashBoard);
router.get("/account", renderAccount);
router.get("/movie", renderMovie);

// API support account management
router.delete('/users/:username', deleteUser);
router.patch('/users/:username/block', blockUser);
router.patch('/users/:username/unblock', unblockUser);
router.get('/users', getFilteredAndSortedUsers);

// API support movie management
router.get('/movies', getFilteredAndSortedMovies);
router.post('/movies', uploadPoster.single('movieImage'), createMovie);
router.get('/movies/:id', getMovieById);
router.put('/movies/:id', uploadPoster.single('movieImage'), updateMovie);
router.delete('/movies/:id', deleteMovie);

// API support dashboard management
router.get('/dashboard/total-users', getTotalUsersCount);
router.get('/dashboard/total-movies', getTotalMoviesCount);

module.exports = router;
