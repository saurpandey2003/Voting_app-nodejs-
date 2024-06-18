const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const candidateSchema = require('../model/candidate');
const userSchema = require('../model/user');
const { VoteDB } = require('../db');
const { generateToken, jwtAuthMiddleware } = require('../jwt');

// Create the models using the VoteDB connection
const candidateModel = VoteDB.model('candidate', candidateSchema);
const userModel = VoteDB.model('user', userSchema);

const checkAdminRole = async (userID) => {
    try {
        const user = await userModel.findById(userID);
        if (user.role === 'admin') {
            return true;
        }
        return false;
    } catch (err) {
        console.error("Error checking admin role:", err);
        return false;
    }
}

router.post('/', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!await checkAdminRole(req.user.id)) {
            return res.status(403).json({ message: 'User does not have admin role' });
        }
        const data = req.body;
        const newCandidate = new candidateModel(data);
        const response = await newCandidate.save();
        console.log("Data saved");

        res.status(201).json({ response });
    } catch (err) {
        console.log("Internal error:", err.message);
        res.status(500).json({ error: "Internal error" });
    }
});

router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!await checkAdminRole(req.user.id)) {
            return res.status(403).json({ message: 'User does not have admin role' });
        }

        const candidateID = req.params.candidateID;
        const updateCandidateData = req.body;

        const response = await candidateModel.findByIdAndUpdate(candidateID, updateCandidateData, {
            new: true,
            runValidators: true
        });
        console.log("Data updated");
        res.status(200).json(response);
    } catch (err) {
        console.log("Server error:", err.message);
        res.status(500).json({ message: "Server error" });
    }
});

router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!await checkAdminRole(req.user.id)) {
            return res.status(403).json({ message: 'User does not have admin role' });
        }
        const candidateID = req.params.candidateID;

        await candidateModel.findByIdAndDelete(candidateID);
        console.log("Candidate data deleted");
        res.status(200).json({ message: "Candidate data deleted" });
    } catch (err) {
        console.log("Server error:", err.message);
        res.status(500).json({ message: "Server errors" });
    }
});

router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        const candidateID = req.params.candidateID;
        const userID = req.user.id;

        const candidate = await candidateModel.findById(candidateID);
        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found" });
        }

        const user = await userModel.findById(userID);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isVoted) {
            return res.status(400).json({ message: "User has already voted" });
        }

        if (user.role !== 'voter') {
            return res.status(403).json({ message: "admin not allowed to vote" });
        }

       candidate.votes.push({user:userID})
       candidate.voteCount++;
       await candidate.save();
       user.isVoted=true;
       await user.save();

        res.status(200).json({ message: "Vote cast successfully" });
    } catch (err) {
        console.log("Server error:", err.message);
        res.status(500).json({ message: "Server error" });
    }
});

router.get('/vote/count', async (req, res) => {
    try {
        const candidates = await candidateModel.find().sort({ votes: 'desc' });
        const voteRecord = candidates.map((data) => {
            return {
                party: data.party,
                countdetails: data.votes,
                votecount:data.voteCount
            }
        });
        res.status(200).json(voteRecord);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal error" });
    }
});

module.exports = router;
