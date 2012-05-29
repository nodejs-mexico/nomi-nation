var node = require('cloudnode-api').nodester,
    config = require('./config'),
    log = require('./log');


module.exports = {
    usage: function() {
        log.usage('status - Show', config.brand, 'API status');
    },
    run: function() {
        log.info('checking api status for:', config.apihost);

        if (config.apisecure) {
            log.info('using secure connection');
        }

        var nodeapi = new node('', '', config.apihost, config.apisecure);
        nodeapi.status(function (err, data) {
            for (var i in data) {
                log.info(i, data[i].toString().bold);
            }
        });
    }
}

