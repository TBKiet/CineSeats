const {registerHandler} = require('./auth.service');
const passport = require("passport");
const User = require("./auth.models");
const bcrypt = require("bcryptjs");
const crypto = require('crypto');
const sendEmail = require("../../utility/sendEmail");
const {Op} = require("sequelize");
const passwordStrength = require("../../utility/checkInput").passwordStrength;

const renderLogin = (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    res.render("login", {layout: "main"});
};

const login = passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
});

const renderRegister = (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    res.render("register", {layout: "main"});
};

const register = (req, res) => {
    const {username, email, password, re_password} = req.body;
    registerHandler(username, email, password, re_password, res, req);
};

const renderForgotPassword = (req, res) => {
    res.render('forgot-password', {layout: 'main'});
};

const forgotPassword = async (req, res) => {
    const {email} = req.body;
    const user = await User.findOne({where: {email}});
    if (!user) {
        return res.render('forgot-password', {alert: 'Email not found', alertType: 'danger'});
    }

    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expires = Date.now() + 10 * 60 * 1000;

    await user.update({
        activationToken: hashedToken,
        activationExpires: expires,
    });

    const resetURL = `${req.protocol}://${req.get('host')}/reset-password?token=${token}`;
    const message = `Click this link to reset your password: ${resetURL}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset',
            message,
        });
        res.render('forgot-password', {alert: 'Email sent successfully', alertType: 'success'});
    } catch (err) {
        await user.update({activationToken: null, activationExpires: null});
        res.render('forgot-password', {alert: 'Error sending email', alertType: 'danger'});
    }
};

const renderResetPassword = async (req, res) => {
    const {token} = req.query;
    if (!token) {
        return res.redirect('/forgot-password');
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
        where: {
            activationToken: hashedToken,
            activationExpires: {[Op.gt]: Date.now()},
        },
    });

    if (!user) {
        return res.redirect('/forgot-password');
    }

    req.session.username = user.username;
    res.render('reset-password', {layout: 'main'});
};

const resetPassword = async (req, res) => {
    const {password, re_password} = req.body;
    const username = req.session.username;

    if (!username) {
        return res.redirect('/forgot-password');
    }

    if (!password || !re_password) {
        return res.render('reset-password', {alert: 'Please enter all fields', alertType: 'danger'});
    }

    if (password !== re_password) {
        return res.render('reset-password', {alert: 'Passwords do not match', alertType: 'danger'});
    }

    if (passwordStrength(password) < 3) {
        return res.render('reset-password', {alert: 'Password is weak', alertType: 'danger'});
    }

    try {
        const user = await User.findOne({where: {username}});

        if (!user) {
            return res.redirect('/forgot-password');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await user.update({
            password: hashedPassword,
            activationToken: null,
            activationExpires: null,
        });

        req.session.username = null;
        res.render('login', {alert: 'Password reset successfully', alertType: 'success'});
    } catch (err) {
        console.error(err);
        res.render('reset-password', {alert: 'Error resetting password', alertType: 'danger'});
    }
};

const verifyEmail = async (req, res) => {
    const {token} = req.query;

    if (!token) {
        return res.status(400).json({message: 'Token is missing'});
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    try {
        const user = await User.findOne({
            where: {
                activationToken: hashedToken,
                activationExpires: {[Op.gt]: Date.now()},
            },
        });

        if (!user) {
            return res.status(400).json({message: 'Token is invalid or has expired'});
        }

        await user.update({
            isActive: true,
            activationToken: null,
            activationExpires: null,
        });

        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error verifying email'});
    }
};

const checkAvailability = async (req, res) => {
    const {field, value} = req.body;

    if (!field || !value) {
        return res.status(400).json({available: false, message: 'Invalid input'});
    }

    try {
        const query = {};
        query[field] = value;

        const existingUser = await User.findOne({where: query});

        if (existingUser) {
            return res.json({available: false, message: `${field} is not available`});
        }

        res.json({available: true, message: `${field} is available`});
    } catch (err) {
        console.error(err);
        res.status(500).json({available: false, message: 'Server error'});
    }
};

const logout = (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        req.session.destroy(err => {
            if (err) return next(err);
            res.redirect("/");
        });
    });
};

module.exports = {
    login,
    register,
    renderLogin,
    renderRegister,
    logout,
    renderForgotPassword,
    forgotPassword,
    renderResetPassword,
    resetPassword,
    verifyEmail,
    checkAvailability,
};