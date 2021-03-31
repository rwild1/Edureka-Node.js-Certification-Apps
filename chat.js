import express from 'express' 
import http from 'http' 
import path from 'path' 
import socketIO from 'socket.io' 
import {LocalStorage} from 'node-localstorage' 
import iplocate from 'node-iplocate' 
import publicIP from 'public-ip' 


const app=express() 
app.set('port',process.env.PORT||3333) 
app.use(express.static(path.join(__dirname,'public'))) 
let localstorage= new LocalStorage('./Scratch') 

//http server created using express app 
let server=http.createServer(app).listen(app.get('port'),()=>{ 
    console.log("express app is up on ",app.get('port')) 
}) 

let io = socketIO(server) 

io.sockets.on('connection',(socket)=>{ 

let list=socket.client.conn.server.clients 
let users=Object.keys(list) 


//consuming my events with labels 
socket.on('nick',(nick)=>{ 
    socket.nickname=nick 
    socket.emit('userList',users) 
}) 

socket.on('chat',(data)=>{ 

    publicIP.v4() 
    .then(ip=>{ 
        iplocate(ip) 
            .then((results)=>{ 
                let city=JSON.stringify(results.city,null,2) 
                localstorage.setItem('userLocal',city) 
            }) 
    }) 

let nickname=socket.nickname?socket.nickname:''; 
let datetime = new Date();

let payload={ 
    message:data.message, 
    nick:nickname, 
    location:localstorage.getItem('userLocal'),
    date: datetime
} 

socket.emit('chat',payload) 
socket.broadcast.emit('chat',payload) 

}) 


})