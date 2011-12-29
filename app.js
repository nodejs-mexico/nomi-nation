/**
 * Module dependencies.
 */

var express = require('express'), 
    //nominator = require('./controllers/nominator.js'),
    Log = require('log'), 
    log = new Log(),
    fs = require('fs');
    //MemoryStore = require('connect/lib/middleware/session/memory'),
    //session_store = new MemoryStore();

var app = module.exports = express.createServer();

// Configuration
app.configure('development', function(){
    log.level = Log.DEBUG;
    log.stream = fs.createWriteStream('logs/dev.log', { flags: 'w' });
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
    log.level = Log.NOTICE;
    log.stream = fs.createWriteStream('/logs/prod.log', { flags: 'w' });
    app.use(express.errorHandler()); 
});

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser()); // cookie parser
    //app.use(express.session({secret: 'nodejsMexico', store: session_store}));
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

// Routes
require('./routes/index')(app, log);

app.listen(process.env.C9_PORT);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
