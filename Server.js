const express=require('express')
const app=express()
const dotenv=require('dotenv')
const ejs=require('ejs')
const mongoose=require('mongoose')
const session=require('express-session')
const MongoDBStore=require('connect-mongodb-session')(session)
const { collection } = require('./models/User')
const {createUser}=require('./controllers/SignupC.js')
const {checkUser}=require('./controllers/LoginC.js')

dotenv.config()
app.use(express.static('public'))
app.set('view engine','ejs')
app.use(express.urlencoded({extended:true})) 
const store=new MongoDBStore({
    uri:process.env.MONGO_URL,
    collection:"UserSession"
})
app.use(session({
    secret:"This is a Secret",
    resave:false,
    saveUninitialized:false,
    store:store
}))
const checkAuth=(req,res,next)=>{
    if(req.session.isAuthenticated){
        next()
    }
    else
    {
        res.redirect('/Signup')
    }
}

app.get('/',(req,res)=>{
    res.render('Welcome')
})
app.get('/Signup',(req,res)=>{
    res.render('Signup')
})
app.get('/Login',(req,res)=>{
    res.render('Login')
})
app.get('/dashboard',checkAuth,(req,res)=>{
    res.render('Diary')
})

app.post('/Signup',createUser)
app.post('/Login',checkUser)

mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log("MongoDB Connected Successfully...")
}).catch((err)=>{
    console.log(err)
})

app.listen(process.env.PORT,()=>{
    console.log("The Server is Listening at Port No",process.env.PORT);
})