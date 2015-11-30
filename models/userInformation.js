var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/* User Information Schema */
var userInformationSchema = new Schema({
	user: String,
 	place: String,
  	rating: Number,
  	type: [String],
  	liked: Boolean,
	created_at: Date
});

/* Before every save this function updates some of the user information */
userInformationSchema.pre('save', function(next) {
 
  var currentDate = new Date();
  this.created_at = currentDate;
  next();
});

/* Exports the module */
var UserInformation = mongoose.model('UserInformation', userInformationSchema);
module.exports = UserInformation;