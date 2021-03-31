// IMPORTS
import { Router, json, urlencoded } from 'express';
import cors from 'cors'
import user from '../model/user'
import news from '../model/newsModel'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import config from '../config'
import { LocalStorage } from 'node-localstorage'


//DEFINING CONSTANTS
const router = Router();
var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
}

// REGISTER NEW USER
router.route('/register').post(json(), urlencoded({ extended: false }), cors(corsOptions), (request, response) => {
  // ENCRYPT PASSWORD
  let hashedPassword = bcrypt.hashSync(request.body.password, 8)
  // CREATE USER IN DB
  user.create({
    name: request.body.name,
    email: request.body.email,
    password: hashedPassword,
    isAdmin: true
  }, (err, user) => {
    if (err)
      return response.write("<script language='javascript'>window.alert('Unable to Register!');window.location='registerPage';</script>");
    return response.write("<script language='javascript'>window.alert('Registration was Successful!');window.location='loginPage';</script>");
  })
});

// LOGIN TO ADMIN PORTAL
router.route('/login').post(json(), urlencoded({ extended: false }), cors(corsOptions), (request, response) => {
  // FIND USER (IF EXISTS)
  user.findOne({ email: request.body.email }, (err, user) => {
    if (err || !user) {
      return response.write("<script language='javascript'>window.alert('User not Found!');window.location='loginPage';</script>");
    }
    else if (!user.isAdmin) {
      return response.status(500).send('User is not an Admin')
    }
    else {
      // PASSWORD VALIDATION
      const passIsValid = bcrypt.compareSync(request.body.password, user.password)
      if (!passIsValid)
        return response.write("<script language='javascript'>window.alert('Password is Incorrect');window.location='loginPage';</script>");
      // CREATE & SAVE TOKEN
      let token = jwt.sign({ id: user.id }, config.secret, { expiresIn: 86400 })
      let localStorage = new LocalStorage('./Scratch')
      localStorage.setItem('authToken', token)
      response.redirect('/admin/verified')
    }
  })
});

// LOG OUT OF ADMIN PORTAL
router.route('/logout').get((request, response) => {
  let localStorage = new LocalStorage('./Scratch')
  localStorage.removeItem('authToken')
  response.redirect('/')
})

// JWT AUTHENTICATION
router.route('/verified').get((request, response) => {
  let localStorage = new LocalStorage('./Scratch')
  let token = localStorage.getItem('authToken')
  if (!token)
    return response.redirect('/')
  jwt.verify(token, config.secret, (err, decoded) => {
    if (err)
      response.redirect('/')
    user.findById(decoded.id, { password: 0 }, (err, user) => {
      if (err)
        response.redirect('/')
      if (!user)
        response.redirect('/')
      response.render('partials/newsForm', { user })
    })
  })
});

// ADD NEWS TO DATABASE
router.route('/addNews').post(json(), urlencoded({ extended: false }), cors(corsOptions), (request, response) => {
  // CREATE NEWS IN DB
  news.create({
    title: request.body.title,
    description: request.body.description,
    url: request.body.url,
    urlToImage: request.body.urlToImage,
    publishedAt: request.body.publishedAt,
    insertTime: Date.now(),
    category: request.body.category
  }, (err, data) => {
    if (err)
      return response.write("<script language='javascript'>window.alert('The News could not be Added!');window.location='addNewsPage';</script>");  /// ADD POP UP INSTEAD!!!!!!! // ADD POP UP INSTEAD!!!!!!!
    response.redirect('/admin/getNews')
  })
});

// GET LIST OF EXISTING NEWS
router.route('/getNews').get(json(), urlencoded({ extended: false }), cors(corsOptions), (request, response) => {
  let localStorage = new LocalStorage('./Scratch')
  let token = localStorage.getItem('authToken')
  if (!token)
    return response.redirect('/')
  jwt.verify(token, config.secret, (err, decoded) => {
    if (err)
      response.redirect('/')
    user.findById(decoded.id, { password: 0 }, (err, user) => {
      if (err)
        response.redirect('/')
      if (!user)
        response.redirect('/')
      news.find({}, (err, data) => {
        if (err)
          return response.write("<script language='javascript'>window.alert('The News List cannot be Displayed');window.location='addNewsPage';</script>");  /// ADD POP UP INSTEAD!!!!!!!
        response.render('partials/newsList', { user, data })
      })
    })
  })
});

// SEND NEWS DATA TO UPDATE FORM
router.route('/openUpdateForm').post(json(), urlencoded({ extended: false }), cors(corsOptions), (request, response) => {
  var news = [{ 
    id: request.body.id, 
    title: request.body.title,
    description: request.body.description,
    url: request.body.url,
    urlToImage: request.body.urlToImage, 
    publishedAt: request.body.publishedAt, 
    category: request.body.category 
  }]
  response.render('partials/updateNews', { news })
})

// UPDATE NEWS IN DATABASE
router.route('/updateNews').post(json(), urlencoded({ extended: false }), cors(corsOptions), (request, response) => {
  const id = request.body.id
  news.findByIdAndUpdate(id, {
    $set: {
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

// DELETE NEWS IN DATABASE
router.route('/deleteNews').post(json(), urlencoded({ extended: false }), cors(corsOptions), (request, response) => {
  const id = request.body.id
  news.findByIdAndDelete(id, (err, result) => {
    if (err)
      throw err
    response.redirect('/admin/getNews')
  })
})

// REDIRECT TO LOGIN PAGE
router.route('/loginPage').get((request, response) => {
  response.render('admin')
})
// REDIRECT TO REGISTER PAGE
router.route('/registerPage').get((request, response) => {
  response.render('register')
})
// REDIRECT TO Add NEWS PAGE
router.route('/addNewsPage').get((request, response) => {
  response.render('partials/newsForm')
})

export default router;