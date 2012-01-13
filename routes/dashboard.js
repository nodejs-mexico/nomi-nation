/**
 * Rutas dashboard 
*/
var fb = require('facebook-js');

module.exports = function(app, log){
    var nominator = require('../controllers/nominator.js');
    
    app.error(function(err, req, res, next){
        log.error('Error: ' + err);
        res.redirect('?error='+err);
    });

    function checkUser(req, res, next){
        if (req.session.user){
            next();
        }else{
            log.notice('someone try to go directly to dashboard on: ' +
                new Date() );
            next(new Error('Not logged in'));
        }
    }
    /**
     * Dashboard landing
    */
    app.get('/dashboard', checkUser, function(req, res){
        log.notice('landed on dashboard user: ' + 
            req.session.user.id + ' on: ' + new Date() );
        res.render('dashboard', { user: req.session.user, error : req.param('error') });
    });
    
    /**
     * lista de amigos de facebook
     */
    app.get('/friends', checkUser, function(req, res){
        res.json(null);
    });
    
    /**
     * lista de mis nominaciones
     */
    app.get('/nominations/mine', checkUser, function(req, res){
        res.json(null);
    });
    
    /**
     * lista de nominaciones donde vote
     */
    app.get('/nominations/voted', checkUser, function(req, res){
        res.json(null);
    });
    
    /**
     * lista de nominaciones donde estoy nominado
     */
    app.get('/nominations/appear', checkUser, function(req, res){
        res.json(null);
    });
    
    /**
     * Crear nominacion
     */
    app.post('/nominations/create', checkUser, function(req, res){
        res.json(false);
    });
    
    /**
     * Borrar nominacion
     */
    app.del('/nominations/erase', checkUser, function(req, res){
        res.json(false);
    });
    
    /**
     * Votar en nominacion
     */
    app.post('/nominations/vote', checkUser, function(req, res){
        res.json(false);
    });
    
    /**
     * Agregar usuario a nominacion
     */
    app.post('/nominations/adduser', checkUser, function(req, res){
        res.json(false);
    });
    
    /**
     * Borrar usuario de nominacion
     */
    app.del('/nominations/eraseuser', checkUser, function(req, res){
        res.json(false);
    });
};