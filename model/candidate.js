const mongoose=require("mongoose");

const candidateSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true

    },
    age:{
        type:Number,
        required:true

    },
    party:{
        type:String,
        required:true

    },
    role:{
        type:String,
        require:true,
        enum:["admin","voter"],
        default:"admin"

    },
    votes:[
        {
            user:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'User',
                require:true
            },
            VotedAT:{
                type:Date,
                default:Date.now()

            }
        }
    ],
    voteCount:{
        type:Number,
        default:0
    }

})
module.exports=candidateSchema;