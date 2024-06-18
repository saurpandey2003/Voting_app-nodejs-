const jwt = require("jsonwebtoken");
require('dotenv').config(); // Ensure environment variables are loaded

const jwtAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.log(err);
        res.status(401).json({ error: "Invalid token" });
    }
};

const generateToken = (userData) => {
    return jwt.sign(userData, process.env.JWT_SECRET);
};

module.exports = { generateToken, jwtAuthMiddleware };
