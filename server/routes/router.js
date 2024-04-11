const express = require("express");
const router = new express.Router();
const userdb = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const authenticate = require("../middleware/authenticate");

//for user registration

router.post("/register", async(req,res)=>{
    const {fname, RegistrationNumber, email, branch, gender, DOB, password, cpassword} = req.body;

    if(!fname || !RegistrationNumber || !email || !branch || !gender || !DOB || !password || !cpassword){
        res.status(422).json({error: "Fill all the details."})
    }

    try{
        const preuser = await userdb.findOne({email:email});
        const preuser2 = await userdb.findOne({RegistrationNumber:RegistrationNumber});

        if(preuser && preuser2){
            res.status(422).json({error: "This user already exists."})
        } else if (password !== cpassword) {
            res.status(422).json({error: "Password does not match."})
        } else {
            const finalUser = new userdb({
                fname, RegistrationNumber, email, branch, gender, DOB, password, cpassword
            });
            //here password hashing will take place
            const storeData = await finalUser.save();
            //console.log(storeData);
            res.status(201).json({status:201,storeData});
        }

    } catch (error){
        res.status(422).json(error);
        console.log("catch block error.")
    }
});

router.post("/login", async(req,res)=>{
    // console.log(req.body);
    const {RegistrationNumber, password} = req.body;

    if(!RegistrationNumber || !password){
        res.status(422).json({error: "Fill all the details."})
    }

    try {
        const userValid = await userdb.findOne({RegistrationNumber:RegistrationNumber});

        if(userValid){
            const isMatch = await bcrypt.compare(password,userValid.password);

            if(!isMatch){
                res.status(422).json({error: "Invalid Detail"})
            } else {
                //generate token
                const token = await userValid.generateAuthtoken();
                //cookie generate
                res.cookie("usercookie",token,{
                    expires:new Date(Date.now()+9000000),
                    httpOnly:true
                });

                const result = {
                    userValid,
                    token
                };
                res.status(201).json({status:201,result})
            }
        }
    } catch (error) {
        res.status(401).json(error);
        console.log("catch block");        
    }
});

//user Valid
router.get("/validuser",authenticate,async(req,res)=>{
    try {
        const ValidUserOne = await userdb.findOne({_id:req.userId});
        res.status(201).json({status:201,ValidUserOne});
    } catch (error) {
        res.status(401).json({status:201,error});
    }
});

//user logout
router.get("/logout", authenticate, async(req,res)=>{
    try {
        req.rootUser.tokens = req.rootUser.tokens.filter((curelem)=>{
            return curelem.token !== req.token
        });

        res.clearCookie("usercookie", {path:"/"});

        req.rootUser.save();

        res.status(201).json({status:201})
    } catch (error) {
        res.status(401).json({status:401, error})
    }
})

module.exports = router;