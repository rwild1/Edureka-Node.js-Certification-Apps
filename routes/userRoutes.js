// IMPORTS
import { Router, json, urlencoded } from 'express';
import cors from 'cors'
import user from '../model/user'
import news from '../model/newsModel'
import { LocalStorage } from 'node-localstorage'
import fetch from 'node-fetch'
import iplocate from 'node-iplocate'
import publicIP from 'public-ip'
import contactus from '../model/contactUsModel'


//DEFINING CONSTANTS
const router = Router();
var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
}

// LOCAL STORAGE
let localstorage = new LocalStorage('./scratch')

// LOCATE CITY FROM IP ADDRESS
publicIP.v4().then(ip => {
  iplocate(ip).then((result) => {
    let res = JSON.stringify(result.city, null, 2)
    localstorage.setItem('userlocal', res)
  })
})

// HOME PAGE
router.route('/').get(async (req, res) => {

  var city = localstorage.getItem('userlocal').replace(/['"]+/g, '')
  var url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&APPID=aea3105660b9f4036abe35b3b815a77e`
  const data =
    await fetch(url)
      .then(res => res.json())
      .then(json => { return json })

  var weather = data.weather[0].main
  var icon = data.weather[0].icon
  var temp = data.main.temp
  var id = data.id
  var wind = data.wind.speed
  var humidity = data.main.humidity
  var clouds = data.clouds.all
  var datetime = data.dt
  var a = news.find().sort({ publishedAt: -1 })

  //Get News from MongoDB
  a.find({}, (err, data) => {
    if (err)
      return response.status(500).send('there was a problem listing news') /// ADD POP UP HERE !!!!
    res.render('index', { weather: weather, icon: icon, temp: temp, city: city, id: id, newsData: data, wind: wind, humidity: humidity, clouds: clouds, datetime: datetime })
  })
})

// SPORTS PAGE
router.route('/sports').get(json(), urlencoded({ extended: false }), cors(corsOptions), async (request, response) => {
  var city = localstorage.getItem('userlocal').replace(/['"]+/g, '')
  var url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&APPID=aea3105660b9f4036abe35b3b815a77e`

  const data =
    await fetch(url)
      .then(res => res.json())
      .then(json => { return json })

  var weather = data.weather[0].main
  var icon = data.weather[0].icon
  var temp = data.main.temp
  var city = city
  var id = data.id
  var a = news.find().sort({ publishedAt: -1 })

  //news.find({}, (err, data) => {
  a.find({}, (err, data) => {
    if (err)
      return response.write("<script language='javascript'>window.alert('The Sports News could not be Displayed!');window.location='sportsPage';</script>") /// ADD POP UP HERE!!!!
    response.render('sports', { newsData: data, weather: weather, icon: icon, temp: temp, city: city, id: id })
  })
});

// CREATE CONTACT US MESSAGE IN DATABASE
router.route('/contactUs').post(json(), urlencoded({ extended: false }), cors(corsOptions), (request, response) => {

  contactus.create({
    name: request.body.name,
    email: request.body.email,
    subject: request.body.subject,
    message: request.body.message
  }, (err, data) => {
    if (err)
      throw err
    else
      return response.write("<script language='javascript'>window.alert('Your Message has been Delivered!');window.location='/contactUsPage';</script>");
  })
});

// CONTACT US PAGE
router.route('/contactUsPage').get(json(), urlencoded({ extended: false }), cors(corsOptions), async (request, response) => {
    var city = localstorage.getItem('userlocal').replace(/['"]+/g, '')
    var url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&APPID=aea3105660b9f4036abe35b3b815a77e`
    const data =  
    await fetch(url)
    .then(res=> res.json())
    .then(json => {return json})
  
    var weather = data.weather[0].main
    var icon = data.weather[0].icon
    var temp = data.main.temp
    var city = city
    var id = data.id

    response.render('contactUs', {weather:weather , icon:icon, temp:temp, city:city, id:id}
    )
})

// ABOUT US PAGE
router.route('/aboutUs').get(json(), urlencoded({ extended: false }), cors(corsOptions), async (request, response) => {
  var city = localstorage.getItem('userlocal').replace(/['"]+/g, '')
  var url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&APPID=aea3105660b9f4036abe35b3b815a77e`
  
  const data =  
  await fetch(url)
  .then(res=> res.json())
  .then(json => {return json})

  var weather = data.weather[0].main
  var icon = data.weather[0].icon
  var temp = data.main.temp
  var city = city
  var id = data.id

  response.render('aboutUs', {weather:weather , icon:icon, temp:temp, city:city, id:id}
  )
})

router.route('/sportsPage').get((request, response) => {
  response.render('sports')
})

export default router;