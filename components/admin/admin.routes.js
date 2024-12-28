const express = require("express");
const router = express.Router();
const { renderAccount, renderDashBoard, renderMovie, deleteUser, blockUser, unblockUser, getFilteredAndSortedUsers, createMovie, getMovieById, updateMovie, deleteMovie, getFilteredAndSortedMovies, getTotalUsersCount } = require("./admin.controllers");
const { upload } = require('../cloudinary/config/cloud');

// Routes for rendering pages
router.get("/dashboard", renderDashBoard);
router.get("/account", renderAccount);
router.get("/movie", renderMovie);

// API support account management
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/block', blockUser);
router.patch('/users/:id/unblock', unblockUser);
router.get('/users', getFilteredAndSortedUsers);

// API support movie management
router.get('/movies', getFilteredAndSortedMovies);
router.post('/movies', upload.single('movieImage'), createMovie);
router.get('/movies/:id', getMovieById);
router.put('/movies/:id', upload.single('movieImage'), updateMovie);
router.delete('/movies/:id', deleteMovie);

// API support dashboard management
router.get('/dashboard/total-users', getTotalUsersCount);

module.exports = router;
