import { Router, json ,urlencoded} from 'express';
import cors from 'cors'
import user from '../model/user'
import news from '../model/newsModel'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import config from '../config'
import {LocalStorage} from 'node-localstorage'


//defining constants
const router = Router();
var corsOptions={
  origin:'*',
  optionsSuccessStatus:200
}

// router.route('/user').get((_, response) => {
//   //using mongoose model 
//   user.find((err,data)=>{
//     if(err)
//       throw err
//     else
//     response.json(data)  
//   })
// });

router.route('/register').post(json(),urlencoded({extended:false}),cors(corsOptions), (request, response) => {
  
  let hashedPassword= bcrypt.hashSync(request.body.password,8)

  //using mongoose model 
user.create({
    name:request.body.name,
    email:request.body.email,
    password:hashedPassword,
    isAdmin:true
  },(err,user)=>{
    if(err)
      return response.status(500).send('there was a problem in registering user')
   //create token 
    //let token= jwt.sign({id:user.id},config.secret,{expiresIn:86400})

   //response.status(200).send({auth:true,token:token})
  // let msg=encodeURIComponent('successfully registered')
    //response.send('successfully registered!!')
    // response.render('partials/registerSuccess')
    return response.write("<script language='javascript'>window.alert('Registration was Successful!');window.location='loginPage';</script>");

  })
});

router.route('/login').post(json(),urlencoded({extended:false}),cors(corsOptions), (request, response) => {
  //find from db if that user exists
  user.findOne({email:request.body.email},(err,user)=>{
    if(err || !user)
    {
      return response.status(500).send('there was a problem in searching for user')
    }
    else if(!user.isAdmin)
    {
      return response.status(500).send('User is not an Admin')
    }
      //  const validString= encodeURIComponent('!please enter a valid value')
      //  if(!user)
      //    response.redirect('/?valid=',validString) 
    else{
            const passIsValid=bcrypt.compareSync(request.body.password,user.password)
            if(!passIsValid)
              // return response.status(401).send({auth:false,token:null})
              return response.write("<script language='javascript'>window.alert('Password is Incorrect');window.location='loginPage';</script>");

            let token = jwt.sign({id:user.id},config.secret,{expiresIn:86400})  
            //return response.status(200).send({auth:true,token:token})
             //save the token in localstorage:
              let localStorage=new LocalStorage('./Scratch')
              localStorage.setItem('authToken',token)
            response.redirect('/admin/verified')

      } 
  })
    
});

router.route('/loginPage').get((request, response) => {
  response.render('admin')
})


router.route('/logout').get((request, response) => {
  let localStorage= new LocalStorage('./Scratch')
  localStorage.removeItem('authToken')
  // response.render('admin')
  response.redirect('/')
})

router.route('/verified').get((request, response) => {
  let localStorage= new LocalStorage('./Scratch')
  let token=localStorage.getItem('authToken')
  console.log(">>>>>>>",token)
  if(!token)
    return response.redirect('/')
  jwt.verify(token,config.secret,(err,decoded)=>{
    if(err)
      response.redirect('/')
    user.findById(decoded.id,{password:0},(err,user)=>{
      if(err)
        response.redirect('/')
      if(!user)
        response.redirect('/')

      response.render('partials/newsForm',{user})
      
   })
  })  
});

// post request to add news into db
router.route('/addNews').post(json(),urlencoded({extended:false}),cors(corsOptions), (request, response) => {
  news.create ({
    title: request.body.title,
    description: request.body.description,
    url: request.body.url,
    urlToImage: request.body.urlToImage,
    publishedAt: request.body.publishedAt,
    insertTime: Date.now(),
    category: request.body.category
  }, (err, data) => {
    if (err)
      return response.status(500).send('there was a problem adding news')
    response.redirect('/admin/getNews')
  })
});

// get request to list existing news
router.route('/getNews').get(json(),urlencoded({extended:false}),cors(corsOptions), (request, response) => {
  let localStorage= new LocalStorage('./Scratch')
  let token=localStorage.getItem('authToken')
  if(!token)
    return response.redirect('/')
  jwt.verify(token,config.secret,(err,decoded)=>{
    if(err)
      response.redirect('/')
    user.findById(decoded.id,{password:0},(err,user)=>{
      if(err)
        response.redirect('/')
      if(!user)
        response.redirect('/')
      news.find({}, (err, data) => {
        if (err)
          return response.status(500).send('there was a problem listing news')
        console.log(data[0])
        response.render('partials/newsList', {user,data})
      })
    })
  })
});

router.route('/openUpdateForm').post(json(),urlencoded({extended:false}), cors(corsOptions), (request, response) => {

  const id = request.body.id
  const title = request.body.title
  const description = request.body.description
  const url = request.body.url
  const urlToImage = request.body.urlToImage
  const publishedAt = request.body.publishedAt
  const category= request.body.category
  console.log(url, urlToImage)
  var news = [{id, title, description, url, urlToImage, publishedAt}]
  console.log("updateNews: ", news)
  // news.findByIdAndUpdate({_id: id})
  response.render('partials/updateNews', {news})
})

router.route('/updateNews').post(json(),urlencoded({extended:false}), cors(corsOptions), (request, response) => {
  const id = request.body.id
  //var news = [{id, title, description, url, urlToImage, publishedAt}]
  console.log("updateNews: ", news)
  news.findByIdAndUpdate(id, {
    $set:{
      title: request.body.title,
      description: request.body.description,
      url: request.body.url,
      urlToImage: request.body.urlToImage,
      publishedAt: request.body.publishedAt,
      category: request.body.category
      
    }
  }, (err, result) => {
    if (err)
      throw err
    response.redirect('/admin/getNews')
  })
})

router.route('/deleteNews').post(json(),urlencoded({extended:false}), cors(corsOptions), (request, response) => {
  const id = request.body.id
  news.findByIdAndDelete(id, (err, result) => {
    if (err)
      throw err
    response.redirect('/admin/getNews')
  })
})


router.route('/contactUsPage').get((request, response) => {
  response.render('contactUs')
})



export default router;