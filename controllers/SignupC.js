const { message } = require('statuses')
const UserSchema=require('../models/User.js')
const bcrypt=require('bcryptjs')

const createUser=async(req,res)=>{
    try{
        const {UserName,Email,Password}=req.body
        let User=await UserSchema.findOne({Email})
        if(User){
            return res.redirect('/Login')
        }
        const hashedPassword=await bcrypt.hash(Password,12)
        User=new UserSchema({UserName,Email,Password:hashedPassword})
        req.session.UserName=UserName
        await User.save()
        req.session.isAuthenticated=true;
        res.redirect('/dashboard')
    }
    catch(err){
        res.status(500).json({message:'_Server Error'})
    }
}

module.exports={createUser}