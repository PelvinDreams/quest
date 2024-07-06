// Load environment variables
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// Import required modules
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");

// Initialize Passport and configure Passport
const initializePassport = require("./passport-config");
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
);

// Example user database (replace with your actual user database)
const users = [];

// Middleware setup
app.set("view engine", "ejs"); // Set view engine to use EJS
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

// Serve static files from the 'public' directory
app.use(express.static(__dirname + '/public'));

// Routes
app.get("/", checkAuthenticated, (req, res) => {
    res.render("index.ejs", { name: req.user.name });
});

app.get("/login", checkNotAuthenticated, (req, res) => {
    res.render("login.ejs");
});
 
app.get("/register", checkNotAuthenticated, (req, res) => {
    res.render("register.ejs");
});

app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}));

app.post("/register", checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });
        console.log(users); // Display newly registered user in the console
        res.redirect("/login");
    } catch (e) {
        console.log(e);
        res.redirect("/register");
    }
});

app.delete("/logout", (req, res) => {
    req.logout(err => {
        if (err) {
            return next(err); // Pass any error to the next middleware
        }
        res.redirect("/login"); // Redirect to login page after logout
    });
});

// Middleware functions
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    next();
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
