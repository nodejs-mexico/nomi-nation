/**
 * Rutas dashboard 
*/
module.exports = function(app, log){
    
    /**
     * Dashboard landing
    */
    app.get('/dashboard', function(req, res){
        log.notice('landed on dashboard user: ' + 
            req.session.user.id + ' on: ' + new Date() );
        res.render('dashboard', { user: req.session.user });
    });
};