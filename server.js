const express=require("express");
const bodyparser=require('body-parser');
const app=express();
app.use(bodyparser.json());
const userSchema=require('./model/user');
const {VoteDB}=require('./db');
const { passport, MiddlewareAuthencation }=require('./Authencation');
const userRouter=require('./Routes/userRoutes');
const candidateRouter=require("./Routes/candidateRouter")


const userModel = VoteDB.model('user', userSchema);
// Middleware
app.use(bodyparser.json());
app.use(passport.initialize()); // Initialize passport

const Middleware = (req, res, next) => {
  console.log(`[${new Date().toLocaleString()}] Request to: ${req.originalUrl}`);
  next();
}

// Use the user router with a prefix
app.use(Middleware);
app.use('/user', userRouter);
app.use('/candidate',candidateRouter);





app.listen(3002,()=>{
    console.log("Lisiting to port 3002");
})
