var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/* User Schema */
var userSchema = new Schema({
	firstName: String,
	lastName: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  lastestSearches: [{type: String}],
	created_at: Date,
	updated_at: Date
});

/* Before every save this function updates some of the user information */
userSchema.pre('save', function(next) {
 
  var currentDate = new Date();
  this.updated_at = currentDate;
  
  if (!this.created_at)
    this.created_at = currentDate;

  next();
});

/* Exports the module */
var User = mongoose.model('User', userSchema);
module.exports = User;