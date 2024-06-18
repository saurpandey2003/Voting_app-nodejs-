const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const userSchema = require('../model/user');
const { VoteDB } = require('../db'); // Ensure correct import
const { generateToken, jwtAuthMiddleware } = require('../jwt'); // Correct import

// Create the user model using the VoteDB connection and userSchema
const userModel = VoteDB.model('user', userSchema);

router.post('/signup', async (req, res) => {
    try {
        const data = req.body;
        const newUser = new userModel(data);
        const response = await newUser.save();
        console.log("Data saved");

        // Generate token
        const token = generateToken({ id: response._id, username: response.username }); // Use generateToken
        console.log("Token is", token);

        // Send response with token
        res.status(201).json({ response: response, token: token });
    } catch (err) {
        console.log("Internal error:", err.message);
        res.status(500).json({ error: "Internal error" });
    }
});

router.get('/', jwtAuthMiddleware, async (req, res) => {
    try {
        const data = await userModel.find();
        res.status(200).json(data);
    } catch (err) {
        console.log("Internal error:", err.message);
        res.status(500).json({ error: "Internal error" });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { addharCardNO, password } = req.body;
        const user = await userModel.findOne({ addharCardNO: addharCardNO });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid password or username' });
        }
        const payload = {
            id: user._id,
        };
        const token = generateToken(payload);
        res.json({ token });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal error" });
    }
});

router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const userdata = req.user;
        const userID = userdata.id;
        const user = await userModel.findById(userID);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ user });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const userID = req.user.id;
        const { currentpswd, newpswd } = req.body;
        const user = await userModel.findById(userID);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!(await user.comparePassword(currentpswd))) {
            return res.status(401).json({ error: 'Invalid current password' });
        }

        user.password = newpswd;
        await user.save();
        console.log("Password updated");
        res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
