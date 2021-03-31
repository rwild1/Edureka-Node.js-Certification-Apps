import express from 'express'
import http from 'http' 
import socketIO from 'socket.io' 
import mongoose from 'mongoose'
import adminRoutes from './routes/adminRoutes'
import userRoutes from './routes/userRoutes'
import {LocalStorage} from 'node-localstorage'
import iplocate from 'node-iplocate' 
import publicIP from 'public-ip'


let localstorage = new LocalStorage('./scratch')

//constants declared
const app=express()
app.set('port',process.env.PORT||5555)

//app configurations
app.use('/',userRoutes)
app.use('/admin',adminRoutes)
app.set('view engine','ejs')
app.use('/public', express.static('public'));

//mongoose connection 
mongoose.connect('mongodb://127.0.0.1:27017/media',{useUnifiedTopology:true,useNewUrlParser:true})
const connection=mongoose.connection;
connection.once('open',()=>{
    console.log("MongoDB connected!!!!")
})

// Tanvir UI part
app.get('/',(request,response)=>{
    response.render('index')
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

//ADDED CHATBOX CODE 
let server=http.createServer(app).listen(app.get('port'),()=>{
    console.log("express app is up on ",app.get('port'))
})

//let  io = socketIO(server)
// io.sockets.on('connection',(socket)=>{
//     let list = socket.client.conn.server.clients
//     let users = Object.keys(list)
//     //consuming my events with labels 
//     socket.on('nick',(nick)=>{
//          socket.nickname=nick
//          socket.emit('userList',users)
//     })
//     socket.on('chat',(data)=>{
//         let nickname=socket.nickname?socket.nickname:'';
//         let payload={
//             message:data.message,
//             nick:nickname,
//         }
//         socket.emit('chat',payload)
//         socket.broadcast.emit('chat',payload)
//     })
// })
//END OF CHATBOX CODE




let io = socketIO(server)

io.sockets.on('connection', (socket)=>{

    //consuming my events with labels
    socket.on('nick', (nick)=>{
        socket.nickname = nick
    })

    socket.on('send', (data)=>{
        publicIP.v4()
            .then(ip=>{
                iplocate(ip)
                    .then((result)=>{
                        let city = JSON.stringify(result.city, null, 2)
                        localstorage.setItem('userLocal', city)
                    })
            })

        let nickname = socket.nickname?socket.nickname:'';
        if(nickname){
            let payload = {
                message:data.message,
                nick:nickname,
                location:localstorage.getItem('userLocal')
            }
    
            socket.emit('send', payload)
            socket.broadcast.emit('send', payload)
        }
    })
})

