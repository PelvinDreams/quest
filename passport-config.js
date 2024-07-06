const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

function initialize(passport, getUserByEmail, getUserById) {
    const authenticateUsers = async (email, password, done) => {
        const user = getUserByEmail(email);
        if (!user) {
            return done(null, false, { message: "No user found with that email" });
        }

        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user);
            } else {
                return done(null, false, { message: "Password incorrect" });
            }
        } catch (e) {
            console.error(e);
            return done(e);
        }
    };

    passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUsers));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        const user = getUserById(id);
        done(null, user);
    });
}

module.exports = initialize;
