const {Ticket, User, Booking} = require("../../api/booking/booking_model");
const {cloudinary} = require('../cloudinary/config/cloud');
const bcrypt = require('bcrypt');
// Add associations in Sequelize models


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
const renderBookingHistory = async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            res.render('account/booking-history');
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.error("Error loading booking history:", error);
        res.status(500).send("Error loading booking history.");
    }
}
const getBookingHistory = async (req, res) => {
    const username = req.user.username; // Assuming user info is stored in `req.user`

    try {
        const bookings = await Booking.findAll({
            where: {username: username},
        });
        const example_booking = [
            {
                bookingID: 1,
                totalAmount: 100000,
                paymentStatus: 'paid',
                paymentMethod: "Momo",
                bookingDateTime: '2021-08-30 10:00:00',
            },
            {
                bookingID: 2,
                totalAmount: 200000,
                paymentStatus: 'pending',
                paymentMethod: "VNPay",
                bookingDateTime: '2021-08-30 10:00:00',
            },
            {
                bookingID: 3,
                totalAmount: 300000,
                paymentStatus: 'paid',
                paymentMethod: "Credit Card",
                bookingDateTime: '2021-08-30 10:00:00',
            },
            {
                bookingID: 4,
                totalAmount: 400000,
                paymentStatus: 'paid',
                paymentMethod: "Credit Card",
                bookingDateTime: '2021-08-30 10:00:00',
            },
            {
                bookingID: 5,
                totalAmount: 500000,
                paymentStatus: 'paid',
                paymentMethod: "Credit Card",
                bookingDateTime: '2021-08-30 10:00:00',
            },
            {
                bookingID: 6,
                totalAmount: 600000,
                paymentStatus: 'paid',
                paymentMethod: "Credit Card",
                bookingDateTime: '2021-08-30 10:00:00',
            },
            {
                bookingID: 7,
                totalAmount: 700000,
                paymentStatus: 'paid',
                paymentMethod: "Credit Card",
                bookingDateTime: '2021-08-30 10:00:00',
            },
            {
                bookingID: 8,
                totalAmount: 700000,
                paymentStatus: 'paid',
                paymentMethod: "Credit Card",
                bookingDateTime: '2021-08-30 10:00:00',
            },
            {
                bookingID: 9,
                totalAmount: 700000,
                paymentStatus: 'paid',
                paymentMethod: "Credit Card",
                bookingDateTime: '2021-08-30 10:00:00',
            },
            {
                bookingID: 10,
                totalAmount: 700000,
                paymentStatus: 'paid',
                paymentMethod: "Credit Card",
                bookingDateTime: '2021-08-30 10:00:00',
            },

        ];
        res.json(example_booking);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Failed to fetch booking history.'});
    }
};

module.exports = {
    renderGeneral,
    updateAccountInfo,
    renderBookingHistory,
    getBookingHistory,
    getInfo,
    renderChangePassword,
    updatePassword
};