import express from 'express'
import mongoose from 'mongoose'
import adminRoutes from './routes/adminRoutes'
import userRoutes from './routes/userRoutes'

import {LocalStorage} from 'node-localstorage'
import fetch from 'node-fetch'
import iplocate from 'node-iplocate'
import publicIP from 'public-ip'


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
app.set("view engine", 'ejs')

//ip and local storage
let localstorage = new LocalStorage('./scratch')

publicIP.v4().then(ip=>{
    iplocate(ip).then((result)=>{
        let res = JSON.stringify(result.city, null, 2)
        localstorage.setItem('userlocal', res)
    })
})


app.get('/', async (req,res)=>{

    var city = localstorage.getItem('userlocal').replace(/['"]+/g, '')

    var url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&APPID=aea3105660b9f4036abe35b3b815a77e`
    
    const data =  
    await fetch(url)
    .then(res=> res.json())
    .then(json => {return json})

    console.log(data)

    
    var weather = data.weather[0].main
    var icon = data.weather[0].icon
    var temp = data.main.temp
    var city = city


    res.render('index', {weather:weather , icon:icon, temp:temp, city:city})
   
})




//start express app
app.listen(port,()=>{
    console.log("app started !!")
})