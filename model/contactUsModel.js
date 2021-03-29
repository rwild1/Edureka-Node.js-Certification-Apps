import mongoose from 'mongoose'

//define my model
var contactUsSchema= mongoose.Schema({
    name:{type:String},
    email:{type:String},
    subject:{type:String},
    message:{type:String}
},
{
    collection:"contactUs"
})

export default mongoose.model('contactus', contactUsSchema)
