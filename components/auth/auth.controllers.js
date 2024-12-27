const { registerHandler } = require('./auth.service');
const passport = require("passport");
const User = require("./auth.models");
const crypto = require('crypto');
const { isValidEmail, passwordStrength } = require('../../utility/checkInput');
const sendEmail = require("../../utility/sendEmail");
const bcrypt = require("bcryptjs");

const renderLogin = (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    res.render("login", { layout: "main" });
};
// Login controller
const login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect('/login');
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            if (user.role === 'admin') {
                return res.redirect('/admin/dashboard');
            }
            return res.redirect('/');
        });
    })(req, res, next);
};

const renderRegister = (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    res.render("register", { layout: "main" });
}
const register = (req, res) => {
    let { username, email, password, re_password } = req.body;
    username = username.trim();
    email = email.trim();
    password = password.trim();
    re_password = re_password.trim();
    registerHandler(username, email, password, re_password, res, req);
};

// render forgot password page
const renderForgotPassword = (req, res) => {
    res.render('forgot-password', { layout: 'main' });
}
// handle forgot password request
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!isValidEmail(email)) {
        return res.render('forgot-password', { alert: 'Email is not available', alertType: 'danger' });
    }
    const user = await User.findOne({ email });
    if (!user) {
        return res.render('forgot-password', { alert: 'Email is not available', alertType: 'danger' });
    }
    const token = user.getVerificationToken();
    await user.save();
    const resetURL = `${req.protocol}://${req.get('host')}/reset-password?token=${token}`;
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
    try {
        await sendEmail({
            email: user.email, subject: 'Your password reset token (valid for 10 minutes)', message
        });
        res.render('forgot-password', { alert: 'Email sent successfully', alertType: 'success' });
    } catch (err) {
        user.activationToken = undefined;
        user.activationExpires = undefined;
        await user.save();
        res.render('forgot-password', { alert: 'Error sending email', alertType: 'danger' });
    }
}
// render reset password page
const renderResetPassword = async (req, res) => {
    const token = req.query.token;
    if (!token) {
        return res.redirect('/forgot-password');
    }
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ activationToken: hashedToken, activationExpires: { $gt: Date.now() } });
    if (!user) {
        return res.redirect('/forgot-password');
    }
    // Lưu thông tin người dùng vào session
    req.session.userId = user._id;
    res.render('reset-password', { layout: 'main' });
}
// handle reset password request
const resetPassword = async (req, res) => {
    const { password, re_password } = req.body;
    const userId = req.session.userId;
    if (!userId) {
        return res.redirect('/forgot-password');
    }
    if (!password || !re_password) {
        return res.render('reset-password', { alert: 'Please enter all fields', alertType: 'danger' });
    }
    if (password !== re_password) {
        return res.render('reset-password', { alert: 'Passwords do not match', alertType: 'danger' });
    }
    if (passwordStrength(password) < 3) {
        return res.render('reset-password', { alert: 'Password is weak', alertType: 'danger' });
    }
    const user = await User.findById(userId);
    if (!user) {
        return res.redirect('/forgot-password');
    }
    const saltRounds = 10;
    user.password = await bcrypt.hash(password, saltRounds);
    user.activationToken = undefined;
    user.activationExpires = undefined;
    await user.save();
    req.session.userId = undefined;
    res.render('login', { alert: 'Password reset successfully', alertType: 'success' });
}
const verifyEmail = async (req, res) => {
    const token = req.query.token;

    if (!token) {
        return res.status(400).json({ message: 'Token is missing' });
    }

    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    const user = await User.findOne({
        activationToken: hashedToken, activationExpires: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ message: 'Token is invalid or has expired' });
    }

    user.isActive = true;
    user.activationToken = undefined;
    user.activationExpires = undefined;
    await user.save();
    res.status(200).json({ message: 'Email verified successfully, you can now login' });
    // res.redirect('/login');
}
const logout = (req, res, next) => { // Include next as a parameter
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.session.destroy((err) => {
            if (err) {
                return next(err);
            }
            res.redirect("/");
        });
    });
};

async function checkAvailability(req, res) {
    const { field, value } = req.body;

    if (!field || !value) {
        return res.status(400).json({ available: false, message: 'Invalid input' });
    }

    try {
        // Dynamically check the field (username or email)
        const query = {};
        query[field] = value;

        const existingUser = await User.findOne(query);

        if (existingUser) {
            if (field === 'email') return res.json({ available: false, message: `Email is not available` });
            return res.json({ available: false, message: `Username is not available` });
        }
        if (field === 'email') return res.json({ available: true, message: `Email is available` });
        return res.json({ available: true, message: `Username is available` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ available: false, message: 'Server error' });
    }
}

module.exports = {
    login,
    register,
    verifyEmail,
    renderLogin,
    renderRegister,
    logout,
    checkAvailability,
    renderForgotPassword,
    forgotPassword,
    renderResetPassword,
    resetPassword
};
