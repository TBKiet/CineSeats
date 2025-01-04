const User = require("./auth.models"); // Sequelize User model
const bcrypt = require("bcryptjs");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const sendEmail = require('../../utility/sendEmail');
const passwordStrength = require('../../utility/checkInput').passwordStrength;
const crypto = require('crypto');

passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const user = await User.findOne({where: {username, isActive: true}});
        if (!user) return done(null, false, {message: 'Incorrect username.'});

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return done(null, false, {message: 'Incorrect password.'});

        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback"
    },
    async (token, tokenSecret, profile, done) => {
        try {
            let user = await User.findOne({where: {email: profile.emails[0].value}});
            if (!user) {
                user = await User.create({
                    username: profile.emails[0].value,
                    email: profile.emails[0].value,
                    password: profile.id,
                    name: profile.displayName,
                    avatar_url: profile.photos[0].value,
                    isActive: true
                });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }));

passport.serializeUser((user, done) => done(null, user.username));
passport.deserializeUser(async (username, done) => {
    try {
        const user = await User.findOne({where: {username}});
        done(null, user);
    } catch (err) {
        done(err);
    }
});

async function registerHandler(username, email, password, re_password, res, req) {
    const renderAlert = (message, type) => res.render('register', {alert: message, alertType: type});

    if (!username || !email || !password || !re_password) {
        return renderAlert('Please enter all fields', 'danger');
    }

    const strength = passwordStrength(password);
    if (strength === 0) {
        return renderAlert('Password must be at least 8 characters', 'danger');
    }
    if (strength < 3) {
        return renderAlert('Your password is not strong enough', 'danger');
    }
    if (password !== re_password) {
        return renderAlert('Passwords do not match', 'danger');
    }

    try {
        const existingUser = await User.findOne({where: {username}});
        const existingEmail = await User.findOne({where: {email}});
        if (existingUser || existingEmail) {
            return renderAlert('User already exists', 'danger');
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            isActive: false,
        });

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
        const expires = Date.now() + 10 * 60 * 1000;

        await newUser.update({
            activationToken: hashedToken,
            activationExpires: expires,
        });

        const verificationUrl = `${req.protocol}://${req.get('host')}/verify?token=${verificationToken}`;
        const message = `Please click this link to verify your email: ${verificationUrl}`;

        await sendEmail({
            email: newUser.email,
            subject: 'Email Verification',
            message,
        });

        renderAlert('Register successful! Please check your email for verification.', 'success');
    } catch (err) {
        console.error('Registration Error:', err);
        renderAlert('Register failed', 'danger');
    }
}

module.exports = {
    registerHandler,
};