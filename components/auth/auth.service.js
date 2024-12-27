const User = require("./auth.models");
const bcrypt = require("bcryptjs");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const sendEmail = require('../../utility/sendEmail');
const passwordStrength = require('../../utility/checkInput').passwordStrength;

passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const user = await User.findOne({ username, isActive: true });
        if (!user) return done(null, false, { message: 'Incorrect username.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return done(null, false, { message: 'Incorrect password.' });

        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

// Serialize and Deserialize User
passport.serializeUser((user, done) => done(null, user.username));
passport.deserializeUser((username, done) => {
    User.findOne({ username })
        .then(user => done(null, user))
        .catch(err => done(err));
});

async function registerHandler(username, email, password, re_password, res, req) {
    const renderAlert = (message, type) => res.render('register', { alert: message, alertType: type });

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
        const existingUser = await User.findOne({ username });
        const existingEmail = await User.findOne({ email });
        if (existingUser || existingEmail) {
            return renderAlert('User already exists', 'danger');
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await User.create({ username, email, password: hashedPassword });

        const verificationToken = newUser.getVerificationToken();
        await newUser.save();

        const verificationUrl = `${req.protocol}://${req.get('host')}/verify?token=${verificationToken}`;
        const message = `Please click this link to verify your email: ${verificationUrl}`;

        await sendEmail({
            email: newUser.email,
            subject: 'Email Verification',
            message,
        });

        renderAlert('Register successful!', 'success');
    } catch (err) {
        console.error('Registration Error:', err);
        renderAlert('Register failed', 'danger');
    }
}

module.exports = {
    registerHandler,
};
