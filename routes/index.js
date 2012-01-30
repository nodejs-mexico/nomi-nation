//Copyright (C) 2011  Ivan Torres -MrPix
/**
 * Rutas principales
*/
var fb = require('facebook-js');

module.exports = function(app, log){
    
    /**
     * GET home page.
    */
    app.get('/', function(req, res){
        log.notice('landed on:' + new Date());
        var ua = req.header('user-agent');
        /*if(/mobile/i.test(ua)) {
            res.json(true);
        }else{*/
            res.render('index', 
                { 
                    error : req.param('error'), 
                    type: 'index', 
                    invited: req.param('invited')
                }
            );
        //}
    });
    
    /**
     * Logout page
     */
    app.get('/logout', function(req, res){
        var ua = req.header('user-agent');
        /*if(/mobile/i.test(ua)) {
            res.json(true);
        }else{*/
            req.session.destroy(function(){ res.redirect('/'); });
        //}
    });
        
    /**
     * Login page
    */
    app.get('/login', function(req, res){
        var redirect = 'http://nomination.cloudno.de/auth/fb';
        if (req.param('invited')){
            redirect = 'http://nomination.cloudno.de/auth/fb?invited='+req.param('invited');
        }
        log.notice('trying to login:' + new Date());
        var reduri = fb.getAuthorizeUrl({
            client_id: '264644053569277', //put the client id
            redirect_uri: redirect, //cambiar si es necesario
            scope: 'offline_access,publish_stream,read_stream'
        });
        var ua = req.header('user-agent');
        /*if(/mobile/i.test(ua)) {
            res.json(reduri);
        }else{*/
            res.redirect(reduri);
        //}
    });    
    /**
     * FB return
    */
    app.get('/auth/fb', function(req, res){
        log.notice('response from fb: ' + new Date());
        var invited = req.param('invited');
        var redirect = 'http://nomination.cloudno.de/auth/fb';
        if (invited){
            redirect = 'http://nomination.cloudno.de/auth/fb?invited='+invited;
        }
        fb.getAccessToken('264644053569277', //clientid
            '76ded2bf195073ce7a183a1ef1cd0b8a', //app secret
            req.param('code'),
            redirect, //cambiar si es necesario
            function (error, access_token, refresh_token) {
                if (error){
                    log.debug('error getting access token:' + error);
                    throw new Error('Error getting the acccess token'); 
                }
                log.notice('trying to get the tokens:' + new Date());
                req.session.user = {};
                req.session.user.access_token = access_token;
                req.session.user.access_token_secret = refresh_token;
                fb.apiCall('GET', '/me/', {access_token: req.session.user.access_token}, function(error, response, body){
                    if (error){
                        log.debug('error getting user info:' + error);
                        throw new Error('Error getting user information'); 
                    }
                    log.notice('getting info from user:' + body.id);
                    req.session.user.name = body.username;
                    req.session.user.id = body.id;                    
                    var dashboard = '/dashboard';
                    if (invited){
                        dashboard = '/dashboard?invited='+invited;
                    }
                    var ua = req.header('user-agent');
                    /*if(/mobile/i.test(ua)) {
                        res.json(invited);
                        return;
                    }*/
                    res.redirect(dashboard);
                });
            }
        );
    });
};