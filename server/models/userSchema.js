const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const keysecret = "eventitisanonlinemeetingplatform"
const userSchema = new mongoose.Schema({
    fname:{
        type:String,
        required: true,
        trim: true
    },
    RegistrationNumber : {
        type:String,
        required: true,
        unique: [true, "Registration Number already exists"],
    },
    email:{
        type:String,
        required: true,
        unique: [true, "Email Address already taken"],
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Not Valid Email")
            }
        }
    },
    branch : {
        type:String,
        required: true,
    },
    gender : {
        type:String,
        required: true
    },
    DOB : {
        type:String,
        required: true,
    },
    password:{
        type:String,
        required: true,
        minlength: 8
    },
    cpassword:{
        type:String,
        required: true,
        minlength: 8
    },
    tokens : [
        {
            token:{
                type: String,
                required: true
            }
        }
    ]
});

//user password hashing
userSchema.pre("save", async function (next){

    if(this.isModified("password")) {
        this.password = await bcrypt.hash(this.password,12);
        this.cpassword = await bcrypt.hash(this.cpassword,12);
    }
    next()
});

//generate token
userSchema.methods.generateAuthtoken = async function(){
    try {
        let token1 = jwt.sign({_id:this._id},keysecret,{
            expiresIn:"600s"
        });
        this.tokens = this.tokens.concat({token:token1});
        await this.save();
        return token1;
    } catch (error) {
        
    }
}

//model creation
const userdb = new mongoose.model("users", userSchema);

module.exports = userdb;