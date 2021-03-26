import mongoose from 'mongoose'



//define my model
var userSchema= mongoose.Schema({
    name:{type:String},
    email:{type:String},
    password:{type:String},
    isAdmin:{type:Boolean}
},
{
    collection:"users"
})


export default mongoose.model('user',  userSchema)