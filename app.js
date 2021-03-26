import express from 'express'
import mongoose from 'mongoose'
import adminRoutes from './routes/adminRoutes'
import userRoutes from './routes/userRoutes'


//constants declared
const app=express()
const port=5555

//mongoose connection 
mongoose.connect('mongodb://127.0.0.1:27017/media',{useUnifiedTopology:true,useNewUrlParser:true})
const connection=mongoose.connection;
connection.once('open',()=>{
    console.log("MongoDB connected!!!!")
})


//app configurations
app.use('/',userRoutes)
app.use('/admin',adminRoutes)

app.set('view engine','ejs')

app.get('/login',(request,response)=>{
    response.render('admin')
})

app.get('/register',(request,response)=>{
    response.render('register')
})


//start express app
app.listen(port,()=>{
    console.log("app started !!")
})