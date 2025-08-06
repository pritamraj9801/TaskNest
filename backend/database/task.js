// Imports the Mongoose instance connected to your MongoDB database from db.js.
const mongoose = require('./db');

// defines the structure
const taskSchema = new mongoose.Schema({
    taskName:{type:String,required:true},
    createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    taskStatus:{type:mongoose.Schema.Types.ObjectId,ref:'TaskStatus'},
    createdDate:{type:Date,required:true}
});

// export
module.exports = mongoose.model('Task',taskSchema);