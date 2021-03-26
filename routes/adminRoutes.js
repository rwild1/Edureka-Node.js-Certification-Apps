import { Router, json } from 'express';
import cors from 'cors'
import user from '../model/user'
import news from '../model/newsModel';


//defining constants
const router = Router();
var corsOptions={
  origin:'*',
  optionsSuccessStatus:200
}

router.route('/admin').get((_, response) => {
  //using mongoose model 
//   user.find((err,data)=>{
//     if(err)
//       throw err
//     else
//     response.json(data)  
// })

});

router.route('/admin').post(json(),cors(corsOptions), (request, response) => {
  //using mongoose model 
//   user.create(request.body,(err,data)=>{
//     if(err)
//      throw err
//     else
//     response.send(data) 
//    })
});

// get request for news form
router.get('/newsForm', (req, res) => {
  const token = localStorage.getItem('authtoken')
  console.log("token: ", token)
  if (!token) {
    res.redirect('/')
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      res.redirect('/')
    }

    user.findById(decoded.id, {password: 0}, (err, user) => {
      if (err) {
        res.redirect('/')
      }
      if (!user) {
        res.redirect('/')
      }
      console.log("/newsForm: user: ", user)
      res.render('newsForm', {
        user,
        msg: req.query.msg ? req.query.msg:''
      })
    })
  })
})

// post request to add news
router.post('/addNews', (req, res) => {
  console.log("/addNews: req.body: ", req.body)
  const token = localStorage.getItem('authtoken')
  console.log("token: ", token)
  if (!token) {
    res.redirect('/')
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      res.redirect('/')
    }

    user.findById(decoded.id, {password: 0}, (err, user) => {
      if (err) {
        res.redirect('/')
      }
      if(!user) {
        res.redirect('/')
      }
      console.log("/newsForm: user: ", user)

      const date = Date.now()
      const news = {...req.body, insertTime: date}
      console.log("/addNews: news: ", news)

      news.create (
        news
      , (err, data) => {
        if (err) return res.status(500).send("There was a problem resgistering user")
        console.log(`Inserted ${data}`)
        const msg = encodeURIComponent('Successfully Added News!')
        res.redirect('/admin/newsForm/?msg=' + msg)
      });
    });
  });
});

export default router;