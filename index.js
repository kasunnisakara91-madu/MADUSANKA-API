require("dotenv").config();

const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const cors = require("cors");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

// =====================================
// BASIC CONFIG
// =====================================

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

// =====================================
// SESSION
// =====================================

app.set("trust proxy", 1);

app.use(
    session({
        secret: process.env.SESSION_SECRET,

        resave: false,

        saveUninitialized: false,

        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        }
    })
);

// =====================================
// PASSPORT
// =====================================

app.use(passport.initialize());
app.use(passport.session());

// =====================================
// GOOGLE OAUTH
// =====================================

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,

            clientSecret:
                process.env.GOOGLE_CLIENT_SECRET,

            callbackURL:
                process.env.GOOGLE_CALLBACK_URL
        },

        async (
            accessToken,
            refreshToken,
            profile,
            done
        ) => {

            try {

                const user = {

                    id: profile.id,

                    name:
                        profile.displayName ||
                        "Google User",

                    email:
                        profile.emails?.[0]?.value ||
                        null,

                    photo:
                        profile.photos?.[0]?.value ||
                        null

                };

                return done(null, user);

            } catch (error) {

                console.error(
                    "Google profile error:",
                    error
                );

                return done(error, null);
            }
        }
    )
);

// =====================================
// SERIALIZE SESSION
// =====================================

passport.serializeUser(
    (user, done) => {

        done(null, user);

    }
);

// =====================================
// DESERIALIZE SESSION
// =====================================

passport.deserializeUser(
    (user, done) => {

        done(null, user);

    }
);

// =====================================
// STATIC FILES
// =====================================

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

// =====================================
// HOME
// =====================================

app.get("/", (req, res) => {

    if (req.isAuthenticated()) {

        return res.redirect(
            "/dashboard.html"
        );

    }

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "login.html"
        )
    );

});

// =====================================
// GOOGLE LOGIN
// =====================================

app.get(
    "/auth/google",

    passport.authenticate(
        "google",
        {
            scope: [
                "profile",
                "email"
            ]
        }
    )
);

// =====================================
// GOOGLE CALLBACK
// =====================================

app.get(
    "/auth/google/callback",

    passport.authenticate(
        "google",
        {
            failureRedirect: "/?error=login_failed"
        }
    ),

    (req, res) => {

        res.redirect(
            "/dashboard.html"
        );

    }
);

// =====================================
// CURRENT USER
// =====================================

app.get(
    "/auth/me",

    (req, res) => {

        if (!req.isAuthenticated()) {

            return res.status(401).json({

                status: false,

                authenticated: false,

                message:
                    "Not authenticated"

            });

        }

        res.json({

            status: true,

            authenticated: true,

            user: req.user

        });

    }
);

// =====================================
// AUTH MIDDLEWARE
// =====================================

function requireLogin(
    req,
    res,
    next
) {

    if (
        !req.isAuthenticated()
    ) {

        return res.status(401).json({

            status: false,

            message:
                "Login required"

        });

    }

    next();

}

// =====================================
// PROTECTED DASHBOARD API
// =====================================

app.get(
    "/api/dashboard",

    requireLogin,

    (req, res) => {

        res.json({

            status: true,

            message:
                "Protected dashboard API",

            user: req.user,

            stats: {

                apiRequests: 0,

                availableApis: 1,

                uptime: "Online"

            }

        });

    }
);

// =====================================
// EXAMPLE PROTECTED API
// =====================================

app.get(
    "/api/user-info",

    requireLogin,

    (req, res) => {

        res.json({

            status: true,

            user: {

                id: req.user.id,

                name: req.user.name,

                email: req.user.email,

                photo: req.user.photo

            }

        });

    }
);

// =====================================
// LOGOUT
// =====================================

app.get(
    "/auth/logout",

    (req, res, next) => {

        req.logout(
            (error) => {

                if (error) {
                    return next(error);
                }

                req.session.destroy(
                    () => {

                        res.clearCookie(
                            "connect.sid"
                        );

                        res.redirect("/");

                    }
                );

            }
        );

    }
);

// =====================================
// HEALTH
// =====================================

app.get(
    "/health",
    (req, res) => {

        res.json({

            status: true,

            name:
                "MADUSANKA API",

            message:
                "API is online 🚀",

            authenticated:
                req.isAuthenticated(),

            uptime:
                Math.floor(
                    process.uptime()
                ),

            timestamp:
                new Date().toISOString()

        });

    }
);

// =====================================
// 404
// =====================================

app.use(
    (req, res) => {

        res.status(404).json({

            status: false,

            message:
                "Route not found"

        });

    }
);

// =====================================
// ERROR HANDLER
// =====================================

app.use(
    (error, req, res, next) => {

        console.error(
            "SERVER ERROR:",
            error
        );

        res.status(500).json({

            status: false,

            message:
                "Internal server error"

        });

    }
);

// =====================================
// START
// =====================================

app.listen(
    PORT,
    () => {

        console.log("");
        console.log(
            "================================="
        );

        console.log(
            "       MADUSANKA API"
        );

        console.log(
            "       GOOGLE AUTH ENABLED"
        );

        console.log(
            "================================="
        );

        console.log(
            `PORT: ${PORT}`
        );

        console.log(
            `URL: ${process.env.GOOGLE_CALLBACK_URL}`
        );

        console.log(
            "================================="
        );

    }
);
