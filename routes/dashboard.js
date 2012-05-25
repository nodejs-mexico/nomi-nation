//Copyright (C) 2011  Ivan Torres -MrPix
//TODO: change post msgs to i18 string
/**
 * Rutas dashboard 
*/
var fb = require('facebook-js'),
    url = 'http://nomination.cloudno.de/';

function findIndexByKeyValue(obj, key, value){
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
        var ua = req.header('user-agent');
        if(/mobile/i.test(ua)) {
            res.redirect('/dashboardm');
        }else{
            res.render('dashboard', 
                { 
                    user: req.session.user, 
                    error : req.param('error'), 
                    type: 'dashboard', 
                    invited: invited                
                });
        }
    });
    /**
     * Dashboardm landing
    */
    app.get('/dashboardm', checkUser,    function(req, res){
        //log.notice('landed on dashboard user: ' + 
        //    req.session.user.id + ' on: ' + new Date() );
        //var invited = req.param('invited');
        res.render('dashboardm', 
            { 
                user: req.session.user, 
                error : req.param('error'), 
                type: 'dashboard', 
                invited: false,
                layout: 'layoutm'
            });
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
     * buscar nominaciones 
     */
    app.post('/nominations/search', checkUser, function(req, res){
        var term = req.param('term');
        nominator.findNominationByName( term, function(err, data){
            if (err) { log.debug('error getting nominations:' + err); res.json(null); return; }
            res.json(data);
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
            'ownerdata' : req.session.user.access_token,
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
                        message: app._locals.t('dashboard.voted', {uname: nom.users[index].name , nname: nom.name }),
                        name: app._locals.t('dashboard.vote'),
                        link: url + '?invited=' + req.param('id')
                    },
                    function (error) {
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
                        message: app._locals.t('dashboard.voted_u', { nname: nom.name }),
                        name: app._locals.t('dashboard.vote'),
                        link: url + '?invited=' + req.param('id')
                    },
                    function (error) {
                        if (error) { log.debug('error posting on voted user'); return; }
                        log.notice('posted on the voted user wall: ' + nom.users[index]._id);
                    }
                );
                log.notice('nomination '+ req.param('id') +' voted by: ' + req.session.user.id );
            });
        });        
    });
    
    /**
     * Invitar amigos
     */
    app.post('/invite', checkUser, function(req, res){
        var usersl = req.param('users');
        var userl = 0;
        var onerror;
        if (usersl instanceof Array){
            userl = usersl.length;
            onerror = function (error) {
                        if (error) { log.debug('error posting on voted user'); return; }
                    };
            for (var i=0;i<userl;i++){
                fb.apiCall(
                    'POST',
                    '/'+usersl[i]._id+'/feed',
                    {
                        access_token: req.session.user.access_token,
                        message: app._locals.t('dashboard.invited'),
                        name: app._locals.t('dashboard.nominate'),
                        link: url
                    },
                    onerror
                );
            }
        }else{
            onerror = function (error) {
                    if (error) { log.debug('error posting on voted user'); return; }
                };
            fb.apiCall(
                'POST',
                '/'+usersl._id+'/feed',
                {
                        access_token: req.session.user.access_token,
                        message: app._locals.t('dashboard.invited'),
                        name: app._locals.t('dashboard.nominate'),
                        link: url
                },
                onerror
            );
        }
        res.json(true);
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
                var usersl = req.param('users');
                var userl = 0;
                var onerror = function (error) {
                                if (error) { log.debug('error posting on voted user'); return; }
                            };
                if (usersl instanceof Array){
                    userl = usersl.length;
                    for (var i=0;i<userl;i++){
                        fb.apiCall(
                            'POST',
                            '/'+usersl[i]._id+'/feed',
                            {
                                access_token: req.session.user.access_token,
                                message: app._locals.t('dashboard.added', { nname: doc.name }),
                                name: app._locals.t('dashboard.add'),
                                link: url + '?invited=' + req.param('id')
                            },
                            onerror
                        );
                    }
                }else{
                    fb.apiCall(
                        'POST',
                        '/'+usersl._id+'/feed',
                        {
                            access_token: req.session.user.access_token,
                            message: app._locals.t('dashboard.added', { nname: doc.name }),
                            name: app._locals.t('dashboard.add'),
                            link: url + '?invited=' + req.param('id')
                        },
                        onerror
                    );
                }
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
            if (err) { log.debug('error getting nominations'); res.json(null); return; }            
            if (user === 'eraseme'){
                var index = findIndexByKeyValue(doc.users, "_id", req.session.user.id);
                user = doc.users[index];
            }
            nominator.eraseUser(doc, user, function(err){
                if (err) { log.debug('error erasing nominations'); res.json(null); return; }
                res.json(true);
            });
        });
    });
    
    /**
     * Terminar nominacion
     */
    app.post('/nominations/end', checkUser, function(req, res){
        //TODO: end the nomination and declare a winner automatically
        var id = req.param('id');
        nominator.findNomination(id,function(err, doc){
            if (err) { log.debug('error getting nominations:' + err); res.json(null); return; }
            if (doc){
                var users = doc.users;
                var usersl = doc.users.length;
                var voters = doc.voters;
                var votersl = doc.voters.length;
                if (usersl > 0){
                    var winner = users[0];
                    for (var j=1; j<usersl;j++){
                        if (winner.votes < users[j].votes){
                            winner = users[j];
                        }
                    }
                    res.json(winner);
                    var onerror = function (error) {
                                    if (error) { log.debug('error posting on voted user'); return; }
                                };
                    fb.apiCall(
                        'POST',
                        '/'+req.session.user.id+'/feed',
                        {
                            access_token: req.session.user.access_token,
                            message: app._locals.t('dashboard.won', { wname: winner.name, nname: doc.name }),
                            name: app._locals.t('dashboard.create'),
                            link: url
                        },
                        onerror
                    );
                    for (var i=0;i<usersl;i++){
                        if (users[i]._id == req.session.user.id){ continue; }
                        fb.apiCall(
                            'POST',
                            '/'+users[i]._id+'/feed',
                            {
                                access_token: req.session.user.access_token,
                                message: app._locals.t('dashboard.won', { wname: winner.name, nname: doc.name }),
                                name: app._locals.t('dashboard.create'),
                                link: url
                            },
                            onerror
                        );
                    }
                    for (i=0;i<votersl;i++){
                        if (voters[i]._id == req.session.user.id){ continue; }
                        fb.apiCall(
                            'POST',
                            '/'+voters[i]._id+'/feed',
                            {
                                access_token: req.session.user.access_token,
                                message: app._locals.t('dashboard.won', { wname: winner.name, nname: doc.name }),
                                name: app._locals.t('dashboard.create'),
                                link: url
                            },
                            onerror
                        );
                    }
                }else{
                    res.json(true);
                }
            }
            res.json(true);
            nominator.eraseNomination(id, function(err){
                if (err) { log.debug('error erasing nomination'); return; }
                log.notice('nomination '+ req.param('name') +' erased by: ' + req.session.user.id );
            });
        });
    });
    
};