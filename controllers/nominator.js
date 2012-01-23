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
	return -1;
}

/** 
 * Add vote
 * @nomination object
 * @voterId string
 * @userId string
 * @callback function 
*/
function getDate (array, value) {
  var resp = null;
  array.forEach(function(m){
     if (m[value] !== undefined){
       resp = m[value];
     }
  });
  return resp;
}
function presence (array, value) {
  var resp = -1;
  array.forEach(function(m){
     if (m[value] !== undefined){
       resp = array.indexOf(m);
     }
  });
  return resp;
}
function prettyDate(a) {
    /*
     * prettyDate
     * @parametros {a}
     * @formato {'mm-dd-yyyy' + T + 'HH:MM:ss',  tipo: 'isoDateTime'}
     */
    var d = [
        [60, "menos de un dia"],
        [90, "menos de un dia"],
        [3600, "menos de un dia", 60],
        [5400, "menos de un dia"],
        [86400, "menos de un dia", 3600],
        [129600, "1 dia"],
        [604800, "dias", 86400],
        [907200, "1 semana"],
        [2628E3, "semanas", 604800],
        [3942E3, "1 mes"],
        [31536E3, "meses", 2628E3],
        [47304E3, "1 año"],
        [31536E5, "años", 31536E3],
        [47304E5, "1 milenio"]
    ],
        e = ("" + a).replace(/-/g, "/").replace(/[TZ]/g, " "),
        n = new Date,
        e = (n - new Date(e) + n.getTimezoneOffset() * 0) / 1E3,
        n = "Hace ",
        l = 0,
        h;
    e < 0 && (e = Math.abs(e), n = "");
    for (; h = d[l++];) if (e < h[0]) return h.length == 2 ? (l > 1 ? n : "") + h[1] : (l > 1 ? n : "") + Math.round(e / h[2]) + " " + h[1];
    if (e > 47304E5) return n + Math.round(e / 47304E5) + " Milenios";
    return a
}
NOMINATOR.vote = function(nomination, voterId, userId, callback) {
    //TODO: check we dont want more than 10 users per nomination
    console.log(nomination);
    var isPresent = -1;
    var oldEnough = true;
    try {
        isPresent = presence(nomination.voters, voterId);
        if (isPresent !== -1) {
              oldDate = prettyDate(getDate(nomination.voters, voterId).toISOString()),
              console.log(oldDate)
          if (oldDate.search('menos de un dia') !== -1){
            oldEnough = false;
          }
        } 
    }
    catch (e){
        isPresent = -1;
    }
    if (isPresent < 0){
        var toSave = {};
        toSave[voterId] = new Date;
        nomination.voters.push(toSave);
    }
    //TODO: change to an actual mongo function
    //TODO: push to voters
    if (oldEnough){
      var index = findIndexByKeyValue(nomination.users, "_id", userId);
      nomination.users[index].votes += 1;
      nomination.save(callback);
      //Nomination.update({_id :nomination.id}, {users: nomination.users}, callback);
    } else {
        callback(new Error('No Old Enough'),null);
    }
};

/** 
 * Add user
 * @nomination object
 * @user object
 * @callback function 
*/
NOMINATOR.addUser = function(nomination, user, callback) {
    //TODO: check we dont want more than 10 users per nomination    
    if (user instanceof Array){
        //TODO: check all users in the array in db
        nomination.users = nomination.users.concat(user);
    }else{
        var isPresent = nomination.erased.indexOf(user._id);
        if (isPresent >= 0){ callback(new Error('User can\'t be added'), null); return; }
        isPresent = findIndexByKeyValue(nomination.users, "_id", user._id);
        if (isPresent >= 0){ callback(new Error('User can\'t be added'), null); return; }
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
    nomination.users.remove(user); //erased from the users list
    nomination.erased.push(user._id); //add to the erased so we dont add them again
    nomination.save(callback);
};

/** 
 * Create nomination
 * @nomination object
 * @callback function 
*/
NOMINATOR.createNomination = function(nomination, callback) {
    nomination.votersDate = {}
    var myNomination = new Nomination(nomination);
    myNomination.save(callback);    
};

/** 
 * Erase nomination
 * @nominationid string
 * @callback function 
*/
NOMINATOR.eraseNomination = function(nominationid, callback) {    
    Nomination.remove({'_id' : nominationid }, callback);    
};

/**
 * find nominations the user own
 * @userid fb userid
 * @callback function
 * 
*/
NOMINATOR.findMyNominations = function(userId, callback) {
    Nomination.where('owner', userId)
        .where('active', true)
        .select('name', '_id', 'endDate')
        .run(callback);
};

/**
 * find nominations the user voted
 * @userId fb userid
 * @callback function
 * 
*/
NOMINATOR.findVoted = function(userId, callback) {
    Nomination.where('voters').in([userId])
        .where('active', true)
        .select('name', '_id', 'endDate')
        .run(callback);
};

/**
 * find nominates where the user was nominated
 * @userId fb userid
 * @callback function
 * 
*/
NOMINATOR.findNominated = function(userId, callback) {
    Nomination.where('users._id').in([userId])
        .where('active', true)
        .select('name', '_id', 'endDate')
        .run(callback);
};

/**
 * find one nomination
 * @nomId nomination id
 * @callback function
 * 
*/
NOMINATOR.findNomination = function(nomId, callback) {
    Nomination.findById(nomId, callback);
};

// Exporting functions
module.exports = NOMINATOR;