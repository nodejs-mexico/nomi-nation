/**
 * Rutas principales
 * 
*/
module.exports = function(app, log){
    //var nominator = require('../controllers/nominator.js');
    /*
     * GET home page.
    */
    app.get('/', function(req, res){
        log.notice('landed on:' + new Date());        
        res.render('index', { title: 'Express' });
    });
};