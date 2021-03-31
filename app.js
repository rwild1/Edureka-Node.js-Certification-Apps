import express from 'express'
import http from 'http' 
import path from 'path'
import socketIO from 'socket.io' 
import mongoose from 'mongoose'
import adminRoutes from './routes/adminRoutes'
import userRoutes from './routes/userRoutes'
import {LocalStorage} from 'node-localstorage'
import fetch from 'node-fetch'
import iplocate from 'node-iplocate' 
import publicIP from 'public-ip'




//constants declared
const app=express()
//const port=5555
app.set('port',process.env.PORT||3500)
let localstorage = new LocalStorage('./scratch')


//ADDED CHATBOX CODE 
let server=http.createServer(app).listen(app.get('port'),()=>{
    console.log("express app is up on ",app.get('port'))
})

let  io = socketIO(server)

io.sockets.on('connection',(socket)=>{

    let list = socket.client.conn.server.clients
    let users = Object.keys(list)
    //consuming my events with labels 
    socket.on('nick',(nick)=>{
         socket.nickname=nick
         socket.emit('userList',users)
    })
    socket.on('chat',(data)=>{
        
        let nickname=socket.nickname?socket.nickname:'';
        let payload={
            message:data.message,
            nick:nickname,
        }
        socket.emit('chat',payload)
        socket.broadcast.emit('chat',payload)
    })
})
//END OF CHATBOX CODE

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
app.use('/public', express.static('public'));

// Tanvir UI part
app.get('/',(request,response)=>{
    response.render('index')
})
 app.get('/contactUs', async (request,response)=>{
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
    var id = data.id

    response.render('contactUs', {weather:weather , icon:icon, temp:temp, city:city, id:id}
    )
})

app.get('/sports',async (request,response)=>{
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
    var id = data.id

    response.render('sports', {weather:weather , icon:icon, temp:temp, city:city, id:id}  )
})

app.get('/aboutUs', async (request,response)=>{
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
    var id = data.id

    response.render('aboutUs', {weather:weather , icon:icon, temp:temp, city:city, id:id}
    )
})
app.get('/imgs',(request,response)=>{
    response.render('partials/imageSlider')
})

app.get('/login',(request,response)=>{
    response.render('admin')
})

app.get('/register',(request,response)=>{
    response.render('register')
})


//start express app
// app.listen(port,()=>{
//     console.log("app started !!")
// })