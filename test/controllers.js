//Copyright (C) 2011  Ivan Torres -MrPix
/**
 * 
 * Controller testing
 * 
*/
var vows = require('vows'),
    assert = require('assert'),
    nominator = require('../controllers/nominator.js');

exports.findN = vows.describe('find nominations').addBatch({
    'when finding nominations by name' : {
        topic : function(){
            nominator.findNominationByName('mas', this.callback);
        },
        'result is > 0' : function(err, docs){
            if (err) { console.log(err); return;}
            console.log(docs);
            assert.lengthOf(docs, 1);
        }
    },
    'when finding where 2 voted' : {
        topic : function(){ 
            nominator.findVoted(2,this.callback);
        },
        'result its only one nomination' : function(err, docs){
            if (err) { console.log(err); return; }
            assert.lengthOf(docs, 1);
        },
        'and its test2' : function(err, docs){
            if (err) { console.log(err); return; }
            assert.equal('test2', docs[0].name);
        }
    },
    'when finding where 1 voted' : {
        topic : function(){ 
            nominator.findVoted(1,this.callback);
        },
        'result is 3 nominations' : function(err, docs){
            if (err) { console.log(err); return; }
            assert.lengthOf(docs, 3);
        },
        'and are test1 2 and 3' : function(err, docs){
            if (err) { console.log(err); return; }
            for (var i=0;i<3;i++){
                assert.equal('test'+(i+1), docs[i].name);
            }
        }
    },
    'when finding where 8 voted' : {
        topic : function(){ 
            nominator.findVoted(8,this.callback);
        },
        'result is 0' : function(err, docs){
            if (err) { console.log(err); return; }
            assert.lengthOf(docs, 0);
        }
    }
}).addBatch({
    'when finding 1 nominations' : {
        topic : function(){ 
            nominator.findMyNominations(1,this.callback);
        },
        'result its only one nomination' : function(err, docs){
            if (err) { console.log(err); return; }
            assert.lengthOf(docs, 1);
        },
        'and its test1' : function(err, docs){
            if (err) { console.log(err); return; }
            assert.equal('test1', docs[0].name);
        }
    },
    'when finding 9 nominations' : {
        topic : function(){ 
            nominator.findMyNominations(9,this.callback);
        },
        'result is 0' : function(err, docs){
            if (err) { console.log(err); return; }
            assert.lengthOf(docs, 0);
        }
    }
}).addBatch({
    'when finding where 8 is nominated' : {
        topic : function(){ 
            nominator.findNominated(8,this.callback);
        },
        'result its 3 nominations' : function(err, docs){
            if (err) { console.log(err); return; }
            assert.lengthOf(docs, 3);
        },
        'and its test1, 2 and 3' : function(err, docs){
            if (err) { console.log(err); return; }
            for (var i=0;i<3;i++){
                assert.equal('test'+(i+1), docs[i].name);
            }
        }
    },
    'when finding where 1 is nominated' : {
        topic : function(){ 
            nominator.findNominated(1,this.callback);
        },
        'result is 0 ' : function(err, docs){
            if (err) { console.log(err); return; }
            assert.lengthOf(docs, 0);
        }
    }  
});


//test start
//adding nomination and users
/*
var nomination = {
    'name' : "test3",
    'owner' : "3", //who is the owner of the nomination
    'endDate' : new Date(), //when this nomination is going to end
    'category' : "cat1",
    'sub_cat' : "sub1",
    'active' : true //nomination finished            
};
nominator.createNomination(nomination, function(err, doc){
    if (err) { console.log(err); return; }
    var users = [];
    for(var i = 4; i<12; i++ ){
        users.push({
            "_id" : i,
            "name" : i,
            "votes" : 0
        });
    }
    nominator.addUser(doc, users, function(err){
        if (err) {  console.log(err); return; }
        var user = {"_id":9, "name":9, "votes":0 };
        nominator.eraseUser(doc, user, function(err){
            if (err) {  console.log(err); return; } 
            nominator.addUser(doc, user, function(err){
                if (err) {  console.log(err); return; } 
            });
            nominator.addUser(doc, 
                {"_id":19, "name":19, "votes":0 }, 
                function(err){
                    if (err) {  console.log(err); return; } 
                }
            );
        });
    });
});*/
/* search nominationd and add votes
nominator.findMyNominations(1, function(err, doc){
    if (err) { console.log(err); return; }
    for (var i=2;i<5;i++){
        nominator.vote(doc[0], 1, i, function(err, doc){
            if (err) {  console.log(err); return; }
        });
    }
});
nominator.findMyNominations(2, function(err, doc){
    if (err) { console.log(err); return; }
    for (var i=3;i<6;i++){
        nominator.vote(doc[0], 2, i, function(err, doc){
            if (err) {  console.log(err); return; }
        });
    }
});
nominator.findMyNominations(3, function(err, doc){
    if (err) { console.log(err); return; }
    for (var i=4;i<7;i++){
        nominator.vote(doc[0], 3, i, function(err, doc){
            if (err) {  console.log(err); return; }
        });
    }
});*/
//test end