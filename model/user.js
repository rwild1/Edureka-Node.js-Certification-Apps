import mongoose from 'mongoose'



//define my model
var userSchema= mongoose.Schema({
    name:{type:String},
    address:{type:String},
    email:{type:String},
    //date:{type:Date, default:Date.now},
    //orders:{type:any}
},
{
    collection:"users"
})


export default mongoose.model('user',  userSchema)