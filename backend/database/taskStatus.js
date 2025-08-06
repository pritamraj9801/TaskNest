// imports the shared Mongoose instance from your db.js file so that your models use a common MongoDB connection.
const mongoose = require('./db');

// Defines a schema for a task status
const taskStatusSchema = new mongoose.Schema({
name:{type:String,required:true}
});

// Creating and Exporting the Model
module.exports = mongoose.model('TaskStatus',taskStatusSchema);