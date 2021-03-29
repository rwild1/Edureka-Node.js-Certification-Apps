import mongoose from 'mongoose'

//define my model
var newsSchema= mongoose.Schema({
    title:{type:String},
    description:{type:String},
    url:{type:String},
    urlToImage:{type:String},
    publishedAt:{type:Date},
    insertTime:{type:Date}
},
{
    collection:"news"
})

export default mongoose.model('news',  newsSchema)