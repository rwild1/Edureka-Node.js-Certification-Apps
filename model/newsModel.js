import mongoose from 'mongoose';
const { Schema } = mongoose;

const newsSchema = new mongoose.Schema ({
    title: String,
    description: String,
    url: String,
    urlToImage: String,
    publishedAt: String,
    insertTime: String
});

mongoose.model('News', newsSchema);
module.exports = mongoose.model('News');