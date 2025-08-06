// This user.js file defines and exports a Mongoose model for the User collection in your MongoDB database.
// Imports the mongoose instance configured in your db.js file, so this model will use the existing MongoDB connection.
const mongoose = require('./db');

// defines the structure (schema) of a User document
const userSchema = new mongoose.Schema({
  name:{type:String,required:true},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  joiningdate:{type:Date,required:true},
  isActive:{type:Boolean,required:true},
  encryptedSecretKey:{type:String,required:false}
});

//  Creating and Exporting the Model
module.exports = mongoose.model('User', userSchema);
