const mongoose = require("mongoose");
require('dotenv').config();

// Ensure that the environment variable is defined
if (!process.env.MONGO_URL) {
    console.error("MONGO_URL environment variable is not defined.");
    process.exit(1);
}

const mongoUrl = process.env.MONGO_URL;

const VoteDB = mongoose.createConnection(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

VoteDB.on('connected', () => {
    console.log("VoteDB database connected");
});

VoteDB.on('error', (error) => {
    console.error("Error in VoteDB database connection: ", error);
});

VoteDB.on('disconnected', () => {
    console.log("VoteDB database is disconnected");
});

module.exports = { VoteDB };
