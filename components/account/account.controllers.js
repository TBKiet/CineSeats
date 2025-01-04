const User = require('../../api/booking/booking_model/User');
const Booking = require('../../api/booking/booking_model/Booking');
const {cloudinary} = require('../cloudinary/config/cloud');
const bcrypt = require('bcrypt');

const getInfo = async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            const user = await User.findOne({where: {username: req.user.username}});
            res.status(200).json(user);
        } else {
            res.status(401).send("Unauthorized");
        }
    } catch (error) {
        console.error("Error getting user info:", error);
        res.status(500).send("Error getting user info");
    }
};
// Function to render the general account information view
const renderGeneral = async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            res.render('account/general');
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.error("Error loading dashboard:", error);
        res.status(500).send("Error loading dashboard.");
    }
};

// Function to update user account information
const updateAccountInfo = async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            const {name, email, phone} = req.body;
            const avatar_url = req.file ? req.file.path : null;

            const user = await User.findOne({where: {username: req.user.username}});

            if (user) {
                user.name = name || user.name;
                user.email = email || user.email;
                user.phone = phone || user.phone;
                if (avatar_url) {
                    const result = await cloudinary.uploader.upload(avatar_url);
                    user.avatar_url = result.secure_url;
                }
                await user.save();
                res.status(200).send("Profile updated successfully");
            } else {
                res.status(404).send("User not found");
            }
        } else {
            res.status(401).send("Unauthorized");
        }
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).send("Error updating profile");
    }
};


// render the change password view
const renderChangePassword = async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            res.render('account/change-password');
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.error("Error loading change password:", error);
        res.status(500).send("Error loading change password.");
    }
};

// Function to update user password
const updatePassword = async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            const {current_password, new_password, confirm_password} = req.body;
            const user = await User.findOne({where: {username: req.user.username}});
            if (user) {
                const isMatch = await bcrypt.compare(current_password, user.password);
                if (isMatch) {
                    if (new_password === confirm_password) {
                        user.password = await bcrypt.hash(new_password, 10);
                        await user.save();
                        res.status(200).send("Password updated successfully");
                    } else {
                        res.status(400).send("Passwords do not match");
                    }
                } else {
                    res.status(400).send("Incorrect password");
                }
            } else {
                res.status(404).send("User not found");
            }
        } else {
            res.status(401).send("Unauthorized");
        }
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).send("Error updating password");
    }
};


// Function to render the booking history view
const renderBookingHistory = async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            const bookings = await Booking.findAll({
                where: {username: req.user.username}, include: [{model: User, attributes: ['name', 'email']}]
            });
            res.render('account/booking-history', {bookings});
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.error("Error loading booking history:", error);
        res.status(500).send("Error loading booking history.");
    }
};

module.exports = {
    renderGeneral, updateAccountInfo, renderBookingHistory, getInfo, renderChangePassword, updatePassword
};