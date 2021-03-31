import { Router, json, urlencoded } from 'express';
import cors from 'cors'
import user from '../model/user'
import news from '../model/newsModel'
import {LocalStorage} from 'node-localstorage'
import fetch from 'node-fetch'
import iplocate from 'node-iplocate'
import publicIP from 'public-ip'
import contactus from '../model/contactUsModel'


//defining constants
const router = Router();
var corsOptions={
  origin:'*',
  optionsSuccessStatus:200
}

router.route('/user').get((_, response) => {
  //using mongoose model 
  user.find((err,data)=>{
    if(err)
      throw err
    else
    response.json(data)  
})

});

router.route('/user').post(json(),cors(corsOptions), (request, response) => {
  //using mongoose model 
  user.create(request.body,(err,data)=>{
    if(err)
     throw err
    else
    response.send(data) 
   })
});

//ip and local storage
let localstorage = new LocalStorage('./scratch')

publicIP.v4().then(ip=>{
    iplocate(ip).then((result)=>{
        let res = JSON.stringify(result.city, null, 2)
        localstorage.setItem('userlocal', res)
    })
})



// home page 
router.route('/').get(async (req,res)=>{
  var arr = []
  var newData
  var city = localstorage.getItem('userlocal').replace(/['"]+/g, '')
 
  var url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&APPID=aea3105660b9f4036abe35b3b815a77e`
  
  const data =  
  await fetch(url)
  .then(res=> res.json())
  .then(json => {return json})
  //console.log(data)

  var weather = data.weather[0].main
  var icon = data.weather[0].icon
  var temp = data.main.temp
  var city = city
  var id = data.id
  var wind = data.wind.speed
  var humidity = data.main.humidity
  var clouds = data.clouds.all
  var datetime = data.dt
  // res.render('index', {weather:weather , icon:icon, temp:temp, city:city, id:id})
  var a = news.find().sort({publishedAt:-1})
  //Get News from MongoDB
  a.find({},(err,data)=>{
    
    if (err)
      return response.status(500).send('there was a problem listing news')

   res.render('index', {weather:weather , icon:icon, temp:temp, city:city, id:id, newsData:data, wind:wind,humidity:humidity,clouds:clouds,datetime:datetime})

  })

})

// Get Sports news 
router.route('/sports').get(json(),urlencoded({extended:false}),cors(corsOptions), async (request, response) => {
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


var a = news.find().sort({publishedAt:-1})

   //news.find({}, (err, data) => {
    a.find({},(err,data)=>{
     if (err)
       return response.status(500).send('there was a problem listing news')
      
     response.render('sports', {newsData:data, weather:weather , icon:icon, temp:temp, city:city, id:id}  )
   })
});

router.route('/contactUs').post(json(),urlencoded({extended:false}),cors(corsOptions), (request, response) => {
  //using mongoose model
  console.log("Chechpoint: ",request.body)
  contactus.create({
    name: request.body.name,
    email: request.body.email,
    subject: request.body.subject,
    message: request.body.message
  },(err,data)=>{
    if(err)
     throw err
    else
      // console.log(data)
    // response.render('contactUs') 
    return response.write("<script language='javascript'>window.alert('Query send  Successfully!');window.location='/contactUsPage';</script>");



   })
});

router.route('/contactUsPage').get((request, response) => {
  response.render('contactUs')
})



// get request to list existing news
router.route('/test').get(json(),urlencoded({extended:false}),cors(corsOptions), (request, response) => {
     var arr = [1,2,3]
      news.find({}).sort({publishedAt:1}, (err, data) => {
        if (err)
          return response.status(500).send('there was a problem listing news')
        console.log(data[0])
        // res.send('index', {data:data})
        response.render('partials/test', {user,newsData:data, array:arr})
      })
});



export default router;