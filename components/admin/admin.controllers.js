const { getTotalUsers } = require("../account/account.model");
const { User } = require("../../api/booking/booking_model");
const Movie = require("../movies/movies.model");
const { cloudinary } = require("../cloudinary/config/cloud"); // Import config của Cloudinary
const { Op } = require("sequelize");
const mongoose = require("mongoose");

// Render Pages
// Render trang quản lý tài khoản
const renderAccount = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).send("Access denied.");
  }
  try {
    const users = await User.findAll(); // Fetch all users using Sequelize
    const filteredUsers = users.map((user) => ({
      id: user.id,
      name: user.username,
      email: user.email,
      role: user.role,
      phone: user.phone,
      status: user.status,
    }));
    res.render("admin/account", { users: filteredUsers }); // Render account management page with user list
  } catch (error) {
    console.error("Error loading account management page:", error);
    res.status(500).send("Error loading account management page.");
  }
};

// Render trang dashboard
const renderDashBoard = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).send("Access denied.");
  }
  try {
    res.render("admin/dashboard");
  } catch (error) {
    console.error("Error loading dashboard:", error);
    res.status(500).send("Error loading dashboard.");
  }
};

// Render trang movie
const renderMovie = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).send("Access denied.");
  }
  try {
    // Lấy tất cả phim
    const movies = await Movie.find();
    const movieData = movies.map((movie) => ({
      id: movie.id,
      name: movie.name_vn,
      genre: movie.type_name_en.join(", "), // Join genres with a comma
      country: movie.country_name_en,
      price: movie.price || "N/A", // Default to "N/A" if price is not available
      totalPurchases: movie.totalPurchases || 0, // Default to 0 if totalPurchase is not available
      releasedTime:
        movie.release_date instanceof Date
          ? movie.release_date.toLocaleDateString()
          : "Unknown", // Release date
    }));

    res.render("admin/movie", { movies: movieData });
  } catch (error) {
    console.error("Error loading movie page:", error);
    res.status(500).send("Error loading movie page.");
  }
};

// Users management
// Block user based on username
const blockUser = async (req, res) => {
  try {
    const username = req.params.username;
    if (username === req.user.username) {
      return res.status(400).json({ message: "You cannot block your own account" });
    }
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.isActive = false;
    await user.save();
    res.status(200).json({ message: "User blocked successfully" });
  } catch (error) {
    console.error("Error blocking user:", error);
    res.status(500).json({ message: "Error blocking user" });
  }
};

// Unblock user based on username
const unblockUser = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.isActive = true;
    await user.save();
    res.status(200).json({ message: "User unblocked successfully" });
  } catch (error) {
    console.error("Error unblocking user:", error);
    res.status(500).json({ message: "Error unblocking user" });
  }
};

// Delete user based on username
const deleteUser = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await user.destroy();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
};

// Lấy danh sách người dùng đã lọc và sắp xếp
const getFilteredAndSortedUsers = async (req, res) => {
  try {
    const { username, email, sortBy, sortOrder, role, page = 1, limit = 10 } = req.query;

    // Build query filters
    const filter = {};
    if (username) filter.username = { [Op.like]: `%${username}%` }; // Case-insensitive search
    if (email) filter.email = { [Op.like]: `%${email}%` };
    if (role && role !== "all") filter.role = role;

    // Build sorting options
    const sort = [];
    if (sortBy) {
      sort.push([sortBy, sortOrder === "desc" ? "DESC" : "ASC"]);
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Fetch users from the database with pagination
    const { rows: users, count: totalUsers } = await User.findAndCountAll({
      where: filter,
      order: sort,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({ users, totalUsers, totalPages: Math.ceil(totalUsers / limit), currentPage: parseInt(page) });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Movies Management
// Helper function to get filtered and sorted movies
const getFilteredAndSortedMovies = async (req, res) => {
  try {
    const { name, genre, country, sortBy, sortOrder } = req.query;
    // Build filter query
    const filter = {};
    if (name) filter.name_vn = new RegExp(name, "i"); // Case-insensitive search
    if (genre && genre !== "all") filter.type_name_en = genre;
    if (country && country !== "all") filter.country_name_en = country;

    // Build sort options
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;
    }

    // Fetch movies from the database
    const movies = await Movie.find(filter).sort(sort);

    res.status(200).json({ movies });
  } catch (error) {
    console.error("Error fetching movies:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create a new movie
const createMovie = async (req, res) => {
  try {
    const {
      name_vn,
      name_en,
      director,
      actor,
      release_date,
      country_name_en,
      genre,
      trailer,
      ratings,
      time,
      brief_vn,
      brief_en,
    } = req.body;

    const movieData = {
      _id: new mongoose.Types.ObjectId(),
      id: new mongoose.Types.ObjectId().toHexString(),
      name_vn,
      name_en,
      director,
      actor,
      release_date,
      country_name_en,
      type_name_en: genre ? genre.split(",").map((g) => g.trim()) : [],
      trailer,
      ratings,
      time,
      brief_vn,
      brief_en,
    };

    if (req.file) {
      try {
        const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
          folder: "movie_poster",
          allowed_formats: ["jpeg", "png", "jpg", "gif"],
        });
        movieData.image = cloudinaryResponse.secure_url;
      } catch (uploadError) {
        console.error("Error uploading image to Cloudinary:", uploadError);
        return res.status(500).json({ message: "Error uploading image to Cloudinary." });
      }
    }

    const newMovie = new Movie(movieData);
    await newMovie.save();
    res.status(201).json({ message: "Movie added successfully!", movie: newMovie });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding movie." });
  }
};

// Get a movie by ID
const getMovieById = async (req, res) => {
  try {
    const movieId = req.params.id; // Lấy giá trị `id` từ request params
    // Tìm kiếm bằng trường `id`
    const movie = await Movie.findOne({ id: movieId });
    if (!movie) {
      return res.status(404).send({ message: "Movie not found" });
    }

    res.json(movie); // Trả về kết quả
  } catch (error) {
    console.error(error); // Ghi log lỗi
    res.status(500).send({ message: "Error fetching movie details" });
  }
};

// Update a movie
const updateMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name_vn,
      name_en,
      director,
      actor,
      release_date,
      country_name_en,
      genre,
      trailer,
      ratings,
      time,
      brief_vn,
      brief_en
    } = req.body;

    // Validate if the ID is a valid string
    if (!id) {
      return res.status(400).json({ message: "Invalid movie ID." });
    }

    // Prepare data to update (excluding image part)
    const movieData = {
      name_vn,
      name_en,
      director,
      actor,
      release_date,
      country_name_en,
      type_name_en: genre ? genre.split(",").map((g) => g.trim()) : [], // Handle genres as an array
      trailer,
      ratings,
      time,
      brief_vn,
      brief_en
    };

    // Check if there's a file (movieImage) being uploaded
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path);
        movieData.image = result.secure_url;
      } catch (error) {
        console.error("Error uploading image to Cloudinary:", error);
        return res.status(500).json({ message: "Error uploading image." });
      }
    }

    // Update the movie in the database
    const updatedMovie = await Movie.findOneAndUpdate({ id: id }, movieData, {
      new: true,
    });

    if (!updatedMovie) {
      return res.status(404).json({ message: "Movie not found." });
    }

    res.status(200).json({ message: "Movie updated successfully!", movie: updatedMovie });
  } catch (error) {
    console.error("Error updating movie:", error);
    res.status(500).json({ message: "Error updating movie." });
  }
};

// Delete a movie
const deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMovie = await Movie.findOneAndDelete({ id: id }); // Sử dụng id thay vì _id
    if (!deletedMovie)
      return res.status(404).json({ error: "Movie not found." });
    res.status(200).json({ message: "Movie deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting movie." });
  }
};

const getTotalUsersCount = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Unauthorized");
    }
    const totalUsers = await getTotalUsers(); // Call the model function to get the count
    res.json({ totalUsers }); // Send the total user count in the response
  } catch (error) {
    console.error("Error fetching total users:", error);
    res.status(500).send("Error fetching total users");
  }
};

const getTotalMoviesCount = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Unauthorized");
    }
    const totalMovies = await Movie.countDocuments(); // Count all movies
    res.json({ totalMovies }); // Send the total movie count in the response
  } catch (error) {
    console.error("Error fetching total movies:", error);
    res.status(500).send("Error fetching total movies");
  }
};

module.exports = {
  //render
  renderAccount,
  renderDashBoard,
  renderMovie,
  //user
  deleteUser,
  blockUser,
  unblockUser,
  getFilteredAndSortedUsers,
  getTotalUsersCount,
  //movie
  createMovie,
  getMovieById,
  updateMovie,
  deleteMovie,
  getFilteredAndSortedMovies,
  getTotalMoviesCount,
};
