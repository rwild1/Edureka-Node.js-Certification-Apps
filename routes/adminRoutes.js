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
    response.render('partials/registerSuccess')
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
              return response.status(401).send({auth:false,token:null})
            let token = jwt.sign({id:user.id},config.secret,{expiresIn:86400})  
            //return response.status(200).send({auth:true,token:token})
             //save the token in localstorage:
              let localStorage=new LocalStorage('./Scratch')
              localStorage.setItem('authToken',token)
            response.redirect('/admin/verified')

      } 
  })
    
});

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
    insertTime: Date.now()
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
        response.render('partials/newsList', {user,data})
      })
    })
  })
});

export default router;