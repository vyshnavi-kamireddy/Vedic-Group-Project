const { message } = require('statuses')
const UserSchema=require('../models/User.js')
const bcrypt=require('bcryptjs')

const checkUser=async(req,res)=>{
    try{
        const {Email,Password}=req.body
        let User=await UserSchema.findOne({Email})
        if(!User){
            return res.redirect('/Signup')
        }
        const checkPassword=await bcrypt.compare(Password,User.Password)
        if(!checkPassword){
            return res.send("Wrong Password")
        }
        req.session.isAuthenticated=true;
        res.redirect('/dashboard')
    }
    catch(err){
        res.status(500).json({message:'_Server Error'})
    }
}

module.exports={checkUser}