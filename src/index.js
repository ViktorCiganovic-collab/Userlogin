const express = require('express');
const path = require('path');
require('dotenv').config();
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Set the views directory
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Create a schema 
const LoginSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

// Create a model from the schema
const User = mongoose.model('users', LoginSchema);

// Routes
app.get("/", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

// Handle signup
// Handle signup
app.post("/signup", async (req, res) => {
    const { name, password } = req.body;

    try {
        const existingUser = await User.findOne({ name });
        if (existingUser) {
            return res.status(400).send("User already exists.");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, password: hashedPassword });
        await newUser.save();

        res.render('home', { user: { name } });
    } catch (error) {
        console.error('Signup error:', error.message);
        res.status(500).send("Internal Server Error");
    }
});


// Handle login
// Handle login
app.post("/login", async (req, res) => {
    const { name, password } = req.body;

    try {
        const user = await User.findOne({ name });
        console.log('User found:', user); // Log the user object

        if (user) {
            const match = await bcrypt.compare(password, user.password);
            console.log('Password match:', match); // Log the result of the comparison

            if (match) {
                res.render('home', { user: { name } }); // Pass the username to the home page
            } else {
                res.status(401).send("Invalid username or password.");
            }
        } else {
            res.status(401).send("Invalid username or password.");
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send("Internal Server Error");
    }
});


app.post('/logout', async (req, res) => {
    
    res.render('Logout');

})

const port = 5000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
