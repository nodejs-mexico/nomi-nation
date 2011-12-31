var mongoose = require('mongoose'), 
    models = require('../models/nomination.js'),
    Nomination, db;
    
models.defineModels(mongoose, function() {
  Nomination = mongoose.model('Nomination');
  db = mongoose.connect('mongodb://nominator:nominat0r@ds029257.mongolab.com:29257/nomi-nation');
});

var NOMINATOR = {};

function findIndexByKeyValue(obj, key, value)
{
    var l = obj.length;
    for (var i = 0; i < l; i++) {
		if (obj[i][key] == value) {
			return i;
		}
	}
	return null;
}

/** 
 * Add vote
 * @nomination object
 * @voterId string
 * @userId string
 * @callback function 
*/
NOMINATOR.vote = function(nomination, voterId, userId, callback) {
    //TODO: check we dont want more than 10 users per nomination
    var isPresent;
    try {
        isPresent = nomination.voters.indexOf(voterId);
    }
    catch (e){
        isPresent = 0;
    }
    if (isPresent < 0){
        nomination.voters.push(voterId);
    }else{
        //TODO: change to an actual mongo function
        var index = findIndexByKeyValue(nomination.users, "_id", userId);
        nomination.users[index].votes += 1;
    }
    nomination.save(callback);
    //Nomination.update({_id :nomination.id}, {users: nomination.users}, callback);
};

/** 
 * Add user
 * @nomination object
 * @user object
 * @callback function 
*/
NOMINATOR.addUser = function(nomination, user, callback) {
    //TODO: check we dont want more than 10 users per nomination
    var isPresent = nomination.erased.indexOf(user._id);
    if (isPresent >= 0){ callback(new Error('User can\'t be added'), null); return; }
    if (user instanceof Array){
        nomination.users = user;
    }else{
        nomination.users.push(user);
    }
    nomination.save(callback);
    //Nomination.update({_id :nomination.id}, {users: nomination.users}, callback);
};

/** 
 * Erase user
 * @nomination object
 * @user object
 * @callback function 
*/
NOMINATOR.eraseUser = function(nomination, user, callback) {
    console.log(nomination.users);
    console.log(user);
    nomination.users.remove(user); //erased from the users list
    nomination.erased.push(user._id); //add to the erased so we dont add them again
    nomination.save(callback);
    //Nomination.update({_id :nomination.id}, {users: nomination.users, erased: nomination.erased}, callback);
};

/** 
 * Create nomination
 * @nomination object
 * @callback function 
*/
NOMINATOR.createNomination = function(nomination, callback) {
    var myNomination = new Nomination(nomination);
    myNomination.save(callback);    
};

/**
 * find the nominations i own
 * @userid fb userid
 * @callback function
 * 
*/
NOMINATOR.findMyNominations = function(userId, callback) {
    Nomination.where('owner', userId)
        .run(callback);
};

/**
 * find the nominations i voted
 * @userId fb userid
 * @callback function
 * 
*/
NOMINATOR.findVoted = function(userId, callback) {
    Nomination.where('voters').in([userId])
        .run(callback);
};

/**
 * find the nominates where i was nominated
 * @userId fb userid
 * @callback function
 * 
*/
NOMINATOR.findNominated = function(userId, callback) {
    Nomination.where('users._id').in([userId])
        .run(callback);
};


// Exporting functions
module.exports = NOMINATOR;