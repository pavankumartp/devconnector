const mongoose = require('mongoose');
const config = require('config');
const log = console.log;

const db = config.get("mongoURI");

const connectDB = async ()=>{
  try{
     await mongoose.connect(db, {useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false});
     log('MongoDB connected...');
    } catch(e){
     console.error(e.message);
     process.exit(1);
  }
}

module.exports = connectDB;
 