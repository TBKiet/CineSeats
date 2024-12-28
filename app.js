require("dotenv").config();
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const passport = require("passport");
const { engine } = require("express-handlebars");
const path = require("path");
const MongoStore = require("connect-mongo");

const movieRouter = require("./components/movies/movies.routes");
const homeRouter = require("./components/home/home.routes");
const userRouter = require("./components/auth/auth.routes");
const profileRouter = require("./components/profile/profile.routes");
const adminRouter = require('./components/admin/admin.routes');
const accountRouter = require('./components/account/account.routes');

const movieDBConnection = require('./config/movieDBConnection');
const userDBConnection = require('./config/userDBConnection');
const cineseatsDBConnection = require('./config/cineseatsDBConnection');

const apiMoviesRouter = require('./api/movies/movies.routes');
const apiShowtimeRouter = require('./api/showtime/showtime.routes');

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, "public")));
// Handle register and login form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/movies', apiMoviesRouter);
app.use('/api/showtime', apiShowtimeRouter);
// Set up session middleware with MongoDB store
app.use(session({
    secret: process.env.SESSION_SECRET, // Replace with your own secret
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI_USERDB,
        collectionName: 'sessions'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

// Set up Handlebars view engine
app.engine(
    "hbs",
    engine({
        extname: ".hbs",
        layoutsDir: path.join(__dirname, "views", "layouts"),
        partialsDir: path.join(__dirname, "views", "partials"),
        helpers: {
            add: (a, b) => a + b,
            subtract: (a, b) => a - b,
            eq: (a, b) => a === b,
            gt: (a, b) => a > b,
            lt: (a, b) => a < b,
            lte: (a, b) => a <= b,
            and: (a, b) => a && b,
            range: (start, end) => {
                const range = [];
                for (let i = start; i <= end; i++) {
                    range.push(i);
                }
                return range;
            },
        },
    })
);

app.set("view engine", "hbs");

// Middleware to pass user information to views
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.username = req.user ? req.user.username : null;
    res.locals.user = req.user ? req.user.toObject ? req.user.toObject() : { ...req.user } : null; // Convert user to plain object
    next();
});

// Define routes
app.use("/", userRouter);
app.use("/", homeRouter);
app.use("/movies", movieRouter);
app.use("/profile", profileRouter);

app.get("/about", (req, res) => {
    res.render("about", { layout: "main" });
});

app.get("/contact", (req, res) => {
    res.render("contact", { layout: "main" });
});

app.use('/admin', adminRouter);
app.use('/account', accountRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;