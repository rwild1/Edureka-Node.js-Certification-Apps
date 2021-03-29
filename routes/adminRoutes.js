import { Router, json } from 'express';
import cors from 'cors'
import user from '../model/user'


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

export default router;