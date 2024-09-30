const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

app.use(express.json());
app.use(cors());

// Secret key for JWT
const SECRET_KEY = "bearer";
app.use(express.static(path.join(__dirname, "public")));

// Connect to database
const connection = mysql.createConnection({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Check database connection
connection.connect((err) => {
    if (err) {
        console.error("Database connection failed: " + err.stack);
        return;
    }
    console.log("Connected to database.");
});

// Register
app.post("/register", async (req, res) => {
    const { email, username, password } = req.body;

    // Validate input data
    if (!email || !username || !password) {
        return res.status(400).send({ message: "All fields are required." });
    }

    try {
        // Check if the user already exists
        con.query("SELECT * FROM users WHERE email = ? OR username = ?", [email, username], async (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).send({ message: "Database error: " + err.message });
            }

            // If result is not empty, user already exists
            if (result.length > 0) {
                return res.status(409).send({ message: "User already exists with this email or username." });
            }

            // Hash the password and insert the new user
            const hashedPassword = await bcrypt.hash(password, 10);
            con.query(
                "INSERT INTO users(email, username, password) VALUES(?, ?, ?)",
                [email, username, hashedPassword],
                (err, result) => {
                    if (err) {
                        console.error("Database error:", err);
                        return res.status(500).send({ message: "Database error: " + err.message });
                    }
                    res.status(201).send({ message: "User registered successfully" });
                }
            );
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).send({ message: "Server error: " + error.message });
    }
});

// Login
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Query the database for the user
    con.query("SELECT * FROM users WHERE username=?", [username], async (err, result) => {
        if (err) {
            return res.status(500).send({ message: "Database error: " + err });
        }
        if (result.length === 0) {
            return res.status(404).send({ message: "User not found" });
        }
        const user = result[0];

        // Compare the password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).send({ message: "Incorrect password" });
        }

        // Generate the token
        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, {
            expiresIn: "1h",
        });

        // Send back the token in the response
        res.status(200).send({ message: "Login successful", token });
    });
});

// Protected route
app.get("/protected", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1]; // Ensure this splits correctly

    if (!token) {
        return res.status(401).send({ message: "Access denied, no token provided" });
    }

    try {
        const verified = jwt.verify(token, SECRET_KEY);
        res.status(200).send({ message: "Welcome to the protected route!", user: verified });
    } catch (err) {
        res.status(401).send({ message: "Invalid token" });
    }
});

// Serve the index.html file when the root URL is accessed
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
