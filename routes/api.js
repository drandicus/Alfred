var express = require('express');
var router = express.Router();
var User = require('../models/user');
var bCrypt = require('bcrypt-nodejs');

/* Compares the encrypted password  */
var isValidPassword = function(user, password){
  return bCrypt.compareSync(password, user.password);
}


/* Encrypts the password  */
var createHash = function(password){
	return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

/* API Call to sign a new user up */
router.post('/signup', function(req, res){
	var email = req.body['email'];

	User.findOne({ 'email' :  email }, function(err, user) {
        if (err) {
        	throw err;
        }
        if (user){
        	res.send("Error: User Already Exists");
        	return;
        }

        var newUser = new User();

        // set the user's local credentials
        newUser.email = email;
        newUser.password = createHash(req.body['password']);
        newUser.firstName = req.body['firstName'];
        newUser.lastName = req.body['lastName'];

        newUser.save(function(err) {
            if (err){
                throw err;  
            }  
            res.send("Success")
        });
        
    });
})

/* API Call to login a user */
router.post('/login', function(req, res){
	var email = req.body['email'];
	var password = req.body['password'];

	User.findOne({ 'email' :  email }, function(err, user) {
        if (err){
        	throw err;
        }

        if (!user){
        	res.send("Error: User not Found");
        	return;
        }

        if (!isValidPassword(user, password)){
        	res.send("Error: Incorrect Password");
        	return;
        }

        res.send("Success");
	});
})

/* Gets the YELP request from the business */
router.post('/yelp', function(req, res){
    var yelp = require("yelp").createClient({
      consumer_key: "iaVtWP5WJbhHIFdwH-ajXw", 
      consumer_secret: "vZ_cQQ2_blMjifBbucGtweDPY5k",
      token: "AXoFM6pDM-HzuGpo-eLVCzHkilbZ0QQ_",
      token_secret: "xkTvq7rcT_mdi7nsM36GQIIe39w"
    });

    
    yelp.search({term: req.body.name, location: req.body.formatted_address}, function(err, data){
        if(err) throw err;

        if(data.businesses.length == 0){
            res.send("No Yelp Reviews Found");
            return;
        }

        var searchTerm = data.businesses[0].url;
        searchTerm = searchTerm.substring("http://www.yelp.com/biz/".length);
        
        yelp.business(searchTerm, function(error, data){
            if(err) throw err;

            if(data == null){
                res.send("No Yelp Reviews Found");
                return;
            }

            res.send(data.reviews[0]);
        })
    })

});

module.exports = router;
