/**
 * Rutas principales
*/
var fb = require('facebook-js');

module.exports = function(app, log){
    //var nominator = require('../controllers/nominator.js');
    /**
     * GET home page.
    */
    app.get('/', function(req, res){
        log.notice('landed on:' + new Date());
        res.render('index');
    });    
    /**
     * Login page
    */
    app.get('/login', function(req, res){
        log.notice('trying to login:' + new Date());
        res.redirect(fb.getAuthorizeUrl({
            client_id: '264644053569277', //put the client id
            redirect_uri: 'http://nomi-nation.pinguxx.c9.io/auth/fb', //cambiar si es necesario
            scope: 'offline_access,publish_stream,read_stream'
        }));
    });    
    /**
     * FB return
    */
    app.get('/auth/fb', function(req, res){
        log.notice('response from fb: ' + new Date());
        fb.getAccessToken('264644053569277', //clientid
            '76ded2bf195073ce7a183a1ef1cd0b8a', //app secret
            req.param('code'),
            'http://nomi-nation.pinguxx.c9.io/auth/fb', //cambiar si es necesario
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
                    res.redirect('/dashboard');
                });
            }
        );
    });
};