var mongoose = require('mongoose'), 
    models = require('../models/nomination.js'),
    Nomination, db;
    
models.defineModels(mongoose, function() {
  Nomination = mongoose.model('Nomination');
  db = mongoose.connect('mongodb://nodejsmx:pwd4mongo@ds029257.mongolab.com:29257/nomi-nation');
});

var NOMINATOR = {};

//TODO get a new nomination
NOMINATOR.create = function(type, nn, st) {
    var nomination = new Nomination({
        name : nn,
        type: type,
        sub_type : st,
        active : true
    });
    return nomination;
};

// Exporting functions
module.exports = NOMINATOR;