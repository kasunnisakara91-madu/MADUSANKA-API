require("dotenv").config();

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;
const API_NAME = "MADUSANKA API";
const API_VERSION = "1.0.0";

// =====================================
// Middleware
// =====================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

// =====================================
// Rate Limit
// =====================================

const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,

    standardHeaders: true,
    legacyHeaders: false,

    message: {
        status: false,
        message: "Too many requests. Please try again later."
    }
});

app.use("/api/", apiLimiter);

// =====================================
// Website
// =====================================

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

// =====================================
// API Information
// =====================================

app.get("/api", (req, res) => {

    res.json({
        status: true,
        name: API_NAME,
        version: API_VERSION,

        message: "MADUSANKA API is online 🚀",

        developer: "MADUSANKA",

        endpoints: {
            health: "/health",
            example: "/api/example?apikey=YOUR_API_KEY"
        }
    });

});

// =====================================
// Health Check
// =====================================

app.get("/health", (req, res) => {

    res.json({

        status: true,

        name: API_NAME,

        message: "API is online 🚀",

        uptime: Math.floor(
            process.uptime()
        ),

        timestamp:
            new Date().toISOString()

    });

});

// =====================================
// Example API
// =====================================

app.get("/api/example", (req, res) => {

    const apikey =
        req.query.apikey;

    // API key missing
    if (!apikey) {

        return res.status(401).json({

            status: false,

            message:
                "API key is required"

        });

    }

    // API key invalid
    if (
        !process.env.API_KEY ||
        apikey !== process.env.API_KEY
    ) {

        return res.status(403).json({

            status: false,

            message:
                "Invalid API key"

        });

    }

    // Success
    res.json({

        status: true,

        creator:
            "MADUSANKA API",

        message:
            "Example API working successfully 🚀",

        result: {

            text:
                "Hello World"

        }

    });

});

// =====================================
// API 404
// =====================================

app.use("/api", (req, res) => {

    res.status(404).json({

        status: false,

        message:
            "API endpoint not found"

    });

});

// =====================================
// Website Fallback
// =====================================

app.get("*", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );

});

// =====================================
// Server Error Handler
// =====================================

app.use(
    (err, req, res, next) => {

        console.error(err);

        res.status(500).json({

            status: false,

            message:
                "Internal server error"

        });

    }
);

// =====================================
// Start Server
// =====================================

app.listen(
    PORT,
    () => {

        console.log("");
        console.log(
            "================================"
        );

        console.log(
            "       MADUSANKA API"
        );

        console.log(
            "================================"
        );

        console.log(
            `Server running on port ${PORT}`
        );

        console.log(
            `API: http://localhost:${PORT}/api`
        );

        console.log(
            `Health: http://localhost:${PORT}/health`
        );

        console.log(
            "================================"
        );

        console.log("");

    }
);
