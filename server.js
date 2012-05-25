//Copyright (C) 2011  Ivan Torres -MrPix
/**
 * Module dependencies.
 */
var express = require('express'),
    Log = require('log'),
    log = new Log(),
    fs = require('fs'),
    i18next = require('i18next'),
    MemoryStore = require('express/node_modules/connect/lib/middleware/session/memory'),
    session_store = new MemoryStore(),
    port = process.env.C9_PORT || 3000;
    /*schedule = require('node-schedule'),
    fb = require('facebook-js'),
    url = 'http://nomination.cloudno.de/',
    nominator = require('./controllers/nominator.js');*/

var app = module.exports = express.createServer();

i18next.init({
    ns: { namespaces: ['translation'], defaultNs: 'translation'},
    resSetPath: 'locales/__lng__/new.__ns__.json',
    saveMissing: true
});

// Configuration
app.configure('development', function() {
    log.level = Log.DEBUG;
    log.stream = fs.createWriteStream('logs/dev.log', {
        flags: 'w'
    });
    //port = 80; //cambiar a puerto deseado
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
    .serveDynamicResources(app)
    .serveMissingKeyRoute(app);
    
// Routes
require('./routes/index')(app, log);
require('./routes/dashboard')(app, log);

/*add process to kill old nomination
var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(1, 6)];
rule.hour = 1;
rule.minute = 1;

function endNomination(id, doc){
    if (doc.ownerdata){
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
            var onerror = function (error) {
                            if (error) { log.debug('error posting on voted user'); return; }
                        };
            fb.apiCall(
                'POST',
                '/'+doc.owner+'/feed',
                {
                    access_token: doc.ownerdata,
                    message: app._locals.t('dashboard.won', { wname: winner.name, nname: doc.name }),
                    name: app._locals.t('dashboard.create'),
                    link: url
                },
                onerror
            );
            for (var i=0;i<usersl;i++){
                if (users[i]._id == doc.owner){ continue; }
                fb.apiCall(
                    'POST',
                    '/'+users[i]._id+'/feed',
                    {
                        access_token: doc.ownerdata,
                        message: app._locals.t('dashboard.won', { wname: winner.name, nname: doc.name }),
                        name: app._locals.t('dashboard.create'),
                        link: url
                    },
                    onerror
                );
            }
            for (i=0;i<votersl;i++){
                if (voters[i]._id == doc.owner){ continue; }
                fb.apiCall(
                    'POST',
                    '/'+voters[i]._id+'/feed',
                    {
                        access_token: doc.ownerdata,
                        message: app._locals.t('dashboard.won', { wname: winner.name, nname: doc.name }),
                        name: app._locals.t('dashboard.create'),
                        link: url
                    },
                    onerror
                );
            }
        }
    }
    nominator.eraseNomination(id, function(err){
        if (err) { log.debug('error erasing nomination'); return; }
        log.notice('nomination '+ id +' erased by: cron ' );
    });
}


schedule.scheduleJob(rule, function(){
    nominator.findOldNomination(function(err, doc){
        if (err) { log.debug('error ending nominations with cron'); return; }
        //console.log(doc);
        for (var i=0; i<doc.length;i++){
            endNomination(doc._id, doc);
            //console.log(doc[i]._id, doc[i].owner, doc[i].ownerdata);
        }
    });
});*/

if (!module.parent) {
    app.listen(port);
    console.log("Express server listening on port %d in %s mode", 
        app.address().port, app.settings.env);
}