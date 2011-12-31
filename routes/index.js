/**
 * Rutas principales
 * 
*/
module.exports = function(app, log){
    var nominator = require('../controllers/nominator.js');
    /*
     * GET home page.
    */
    app.get('/', function(req, res){
        log.notice('landed on:' + new Date());
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
                    nominator.addUser(doc, {"_id":19, "name":19, "votes":0 }, function(err){
                        if (err) {  console.log(err); return; } 
                    });
                });
            });
        });*/
        /*
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
        /*find where i voted        
        nominator.findVoted(2, function(err, doc){
            if (err) { console.log(err); return; }
            var l = doc.length;
            for(var i=0;i<l;i++){
                console.log(doc[i]);
            }
        });
        */
        //find where im nominated
        nominator.findNominated(8, function(err, doc){
            if (err) { console.log(err); return; }
            var l = doc.length;
            for(var i=0;i<l;i++){
                console.log(doc[i]);
            }
        });
        //test end
        res.render('index', { title: 'Express' });
    });
};