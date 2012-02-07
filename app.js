//Copyright (C) 2011  Ivan Torres -MrPix
/**
 * Module dependencies.
 */
var express = require('express'),
    Log = require('log'),
    log = new Log(),
    fs = require('fs'),
    i18next = require('i18next'),
    Db = require('mongodb').Db,
    mongoStore = require('connect-mongodb'),
    session_store,
    port = process.env.PORT || 3000;
    
Db.connect("mongodb://nominator:nominat0r@ds029257.mongolab.com:29257/nomination-sessions", function(err, db) {
    session_store = new mongoStore({db: db});
});

var app = module.exports = express.createServer();

i18next.init({
    ns: { namespaces: ['translation'], defaultNs: 'translation'}    
});

// Configuration
app.configure('development', function() {
    log.level = Log.DEBUG;
    log.stream = fs.createWriteStream('logs/dev.log', {
        flags: 'w'
    });
    port = 80; //cambiar a puerto deseado
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
});

app.configure('production', function() {
    log.level = Log.NOTICE;
    log.stream = fs.createWriteStream('/logs/prod.log', {
        flags: 'w'
    });
    app.use(express.errorHandler());
});

app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(i18next.handle);
    app.use(express.methodOverride());
    app.use(express.cookieParser()); // cookie parser
    app.use(express.session({secret: 'nodejsMexico', store: session_store}));
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

i18next.registerAppHelper(app)
    .serveClientScript(app)
    .serveDynamicResources(app);
    
// Routes
require('./routes/index')(app, log);
require('./routes/dashboard')(app, log);

if (!module.parent) {
    app.listen(port);
    console.log("Express server listening on port %d in %s mode", 
        app.address().port, app.settings.env);
}