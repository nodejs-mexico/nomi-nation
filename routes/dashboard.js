/**
 * Rutas dashboard 
*/
var fb = require('facebook-js'),
    url = 'http://nomi-nation.pinguxx.c9.io/';

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

module.exports = function(app, log){
    var nominator = require('../controllers/nominator.js');
    
    app.error(function(err, req, res, next){
        log.error('Error: ' + err);
        if (err.message === 'nli'){
            res.redirect('?error='+err.message);
        }else{
            res.send(err.message);
        }        
    });

    function checkUser(req, res, next){
        if (req.session.user){
            next();
        }else{
            log.notice('someone try to go directly to dashboard on: ' +
                new Date() );
            next(new Error('nli'));
        }
    }
    /**
     * Dashboard landing
    */
    app.get('/dashboard', checkUser, function(req, res){
        log.notice('landed on dashboard user: ' + 
            req.session.user.id + ' on: ' + new Date() );
        var invited = req.param('invited');
        res.render('dashboard', { user: req.session.user, error : req.param('error'), type: 'dashboard', invited: invited });     
    });
    
    /**
     * lista de amigos de facebook
     */
    app.get('/friends', checkUser, function(req, res){
        fb.apiCall('GET', '/me/friends', {access_token: req.session.user.access_token}, function(error, response, body){
            if (error){
                log.debug('error getting friends list:' + error);
                throw new Error('Error getting friends list'); 
            }
            log.notice('getting friends from user:' + req.session.user.id);
            res.json(body);
        });        
    });
    
    /**
     * lista de mis nominaciones
     */
    app.get('/nominations/mine', checkUser, function(req, res){
        nominator.findMyNominations(req.session.user.id,function(err, data){
            if (err) { log.debug('error getting nominations:' + err); res.json(null); return; }
            res.json(data);
        });
    });
    
    /**
     * lista de nominaciones donde vote
     */
    app.get('/nominations/voted', checkUser, function(req, res){
        nominator.findVoted(req.session.user.id,function(err, data){
            if (err) { log.debug('error getting nominations:' + err); res.json(null); return; }
            res.json(data);
        });
    });
    
    /**
     * lista de nominaciones donde estoy nominado
     */
    app.get('/nominations/appear', checkUser, function(req, res){
        nominator.findNominated(req.session.user.id,function(err, data){
            if (err) { log.debug('error getting nominations:' + err); res.json(null); return; }
            res.json(data);
        });
    });
    
    /**
     * regresar nominacion
     */
    app.get('/nominations/:id', checkUser, function(req, res){
        nominator.findNomination(req.params.id,function(err, data){
            if (err) { log.debug('error getting nominations:' + err); res.json(null); return; }
            res.json(data);
        });
    });
    
    /**
     * Crear nominacion
     */
    app.post('/nominations/create', checkUser, function(req, res){
        var nomination = {
            'name' : req.param('name'),
            'owner' : req.session.user.id,
            'endDate' : new Date(req.param('datep')),
            'category' : "cat1",
            'sub_cat' : "sub1",
            'active' : true         
        };
        nominator.createNomination(nomination, function(err, doc){
            if (err) { log.debug(err); return; }
            log.notice('nomination '+ req.param('name') +' created by: ' + req.session.user.id );
            res.json(doc);
        });        
    });
    
    /**
     * Borrar nominacion
     */
    app.post('/nominations/erase', checkUser, function(req, res){
        //TODO: erase nomination
        var id = req.param('id');
        nominator.eraseNomination(id, function(err){
            if (err) { log.debug(err); res.json(null); return; }
            log.notice('nomination '+ req.param('name') +' erased by: ' + req.session.user.id );
            res.json(true);
        });
    });
    
    /**
     * Votar en nominacion
     */
    app.post('/nominations/vote', checkUser, function(req, res){
        //TODO: vote nomination, write in own wall, try to write in other user wall
        var voterid = req.session.user.id;
        var id = req.param('id');
        var userid = req.param('userid');
        //add a friend, try to write to the user wall and local
        nominator.findNomination(id,function(err, doc){
            if (err) { log.debug('error getting nominations:' + err); res.json(null); return; }
            nominator.vote(doc, voterid, userid, function(err, nom){
                if (err) { log.debug('error getting nominations:' + err); res.json(null); return; }
                var index = findIndexByKeyValue(nom.users, "_id", req.param('userid'));                
                res.json(nom.users[index].votes);
                //post to my wall that i voted
                fb.apiCall(
                    'POST',
                    '/'+voterid+'/feed',
                    {
                        access_token: req.session.user.access_token,
                        message: 'Votaste por "' + nom.users[index].name + '" en "' + 
                            nom.name + '" en nomi-nation, vota tu tambien',
                        name: "Votar",
                        link: url + '?invited=' + req.param('id')
                    },
                    function (error, response, body) {
                        if (error) { log.debug('error posting on my wall'); return; }
                        log.notice('posted on current user wall: ' + voterid);
                    }
                );
                //post to the victim
                fb.apiCall(
                    'POST',
                    '/'+nom.users[index]._id+'/feed',
                    {
                        access_token: req.session.user.access_token,
                        message: 'Votaron por ti en "' + nom.name + '" en nomi-nation ' +
                            'vota tu tambien',
                        name: "Votar",
                        link: url + '?invited=' + req.param('id')
                    },
                    function (error, response, body) {
                        if (error) { log.debug('error posting on voted user'); return; }
                        log.notice('posted on the voted user wall: ' + nom.users[index]._id);
                    }
                );
                log.notice('nomination '+ req.param('id') +' voted by: ' + req.session.user.id );
            });
        });        
    });
    
    /**
     * Agregar usuario a nominacion
     */
    app.post('/nominations/adduser', checkUser, function(req, res){
        var users = req.param('users');
        var id = req.param('id');
        //add a friend, try to write to the user wall and local
        nominator.findNomination(id,function(err, doc){
            if (err) { log.debug('error getting nominations:' + err); res.json(null); return; }
            nominator.addUser(doc, users, function(err){
                if (err) { log.debug('error adding users'); res.json(null); return; }
                res.json(true);
            });
        });
    });
    
    /**
     * Borrar usuario de nominacion
     */
    app.post('/nominations/eraseuser', checkUser, function(req, res){
        //just erased, dont notice anyone :(
        var user = req.param('user');
        var id = req.param('id');
        //add a friend, try to write to the user wall and local
        nominator.findNomination(id,function(err, doc){
            if (err) { log.debug('error getting nominations:' + err); res.json(null); return; }
            nominator.eraseUser(doc, user, function(err){
                if (err) { console.log(err); res.json(null); return; }
                res.json(true);
            });
        });
    });
};