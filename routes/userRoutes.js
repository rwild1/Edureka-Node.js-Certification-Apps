import { Router, json } from 'express';
import cors from 'cors'
import user from '../model/user'

import {LocalStorage} from 'node-localstorage'
import fetch from 'node-fetch'
import iplocate from 'node-iplocate'
import publicIP from 'public-ip'


//defining constants
const router = Router();
var corsOptions={
  origin:'*',
  optionsSuccessStatus:200
}


//ip and local storage
let localstorage = new LocalStorage('./scratch')

publicIP.v4().then(ip=>{
    iplocate(ip).then((result)=>{
        let res = JSON.stringify(result.city, null, 2)
        localstorage.setItem('userlocal', res)
    })
})




// router.route('/user').get((_, response) => {
//   //using mongoose model 
//   user.find((err,data)=>{
//     if(err)
//       throw err
//     else
//     response.json(data)  
// })

// });

// router.route('/user').post(json(),cors(corsOptions), (request, response) => {
//   //using mongoose model 
//   user.create(request.body,(err,data)=>{
//     if(err)
//      throw err
//     else
//     response.send(data) 
//    })
// });



router.route('/').get(async (req,res)=>{
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
  

export default router;