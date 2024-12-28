const { User, getUserData, updateUserData } = require('./account.model');
const { cloudinary } = require('../cloudinary/config/cloud');

const renderGeneral = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Unauthorized");
    }
    res.render("account/general");
  } catch (error) {
    console.error("Error loading dashboard:", error);
    res.status(500).send("Error loading dashboard.");
  }
}

const renderMembership = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Unauthorized");
    }
    res.render("account/membership");
  } catch (error) {
    console.error("Error loading dashboard:", error);
    res.status(500).send("Error loading dashboard.");
  }
}

const renderSetting = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Unauthorized");
    }
    res.render("account/setting");
  } catch (error) {
    console.error("Error loading dashboard:", error);
    res.status(500).send("Error loading dashboard.");
  }
}

const renderVoucher = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Unauthorized");
    }
    res.render("account/voucher");
  } catch (error) {
    console.error("Error loading dashboard:", error);
    res.status(500).send("Error loading dashboard.");
  }
}

const renderHistory = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Unauthorized");
    }
    res.render("account/history");
  } catch (error) {
    console.error("Error loading dashboard:", error);
    res.status(500).send("Error loading dashboard.");
  }
}

// Get user account info
const getAccountInfo = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Unauthorized");
    }
    const userId = req.user._id;
    const userData = await getUserData(userId);
    res.json(userData);
  } catch (error) {
    res.status(500).send('Error fetching user data');
  }
};

// Update user account info
const updateAccountInfo = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user._id; // Get the user ID from the authenticated request
    const {
      firstName,
      lastName,
      email,
      phone,
      birthday,
      country,
      address,
      theater,
    } = req.body; // Destructure updated fields from the request body

    // Prepare updated data object
    const updatedData = {
      firstName,
      lastName,
      email,
      phone,
      birthday,
      country,
      address,
      theater,
    };

    // Check if a file (profile picture) is included
    if (req.file) {
      try {
        // Upload the image to Cloudinary
        const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
          folder: "avatar_url", // Folder name in Cloudinary
          allowed_formats: ["jpeg", "png", "jpg", "gif"],
        });

        // Add the image URL to the updatedData object
        updatedData.avatar_url = cloudinaryResponse.secure_url;
      } catch (uploadError) {
        console.error("Error uploading image to Cloudinary:", uploadError);
        return res.status(500).json({ message: "Error uploading profile picture." });
      }
    }

    // Update user information in the database
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true, // Return the updated user document
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "User information updated successfully!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user info:", error);
    res.status(500).json({ message: "Error updating user data." });
  }
};

module.exports = {
  renderGeneral, renderMembership, renderVoucher, renderSetting, renderHistory, getAccountInfo, updateAccountInfo
}
