//Copyright (C) 2011  Ivan Torres -MrPix
/**
 * 
 * Test index route
*/
var app = require('../app'),
    vows = require('vows'),
    assert = require('assert'),
    zombie = require('zombie'),
    jsdom = require('jsdom');
    
app.listen(process.env.PORT || 3000);

exports.index = vows.describe('Visiting index').addBatch({
    'when hitting the page': {
        topic: function(){
            zombie.visit('http://nomi-nation.pinguxx.cloud9ide.com',
                this.callback);
        },
        'we got the page': function(err, browser, status) {
            if (err){
                throw(err.message);
            }
            assert.equal(status, 200);
        },
        'and try to get the title' : {
            topic : function(browser){
                var vow = this;
                jsdom.env({
                    html: browser.response[2],
                    scripts: [
                        'http://code.jquery.com/jquery-1.5.min.js'
                    ],
                    done: vow.callback
                });
            },
            'the title is Express' : function(errors, window) {
                //console.log(errors);
                if (errors){
                    throw(errors);
                }else{
                    var $ = window.$;
                    assert.equal('Nomi-nation', $('title').html());
                }
            }
        }
    }
}).addBatch({
    'when hitting login':{
        topic: function(){
            zombie.visit('http://nomi-nation.pinguxx.cloud9ide.com/login',
                this.callback);
        },
        'we got the page': function(err, browser, status) {
            if (err){
                throw(err.message);
            }
            assert.equal(status, 200);
        },
        'and try to get user name' : {
            topic : function(browser){
                var vow = this;
                jsdom.env({
                    html: browser.response[2],
                    scripts: [
                        'http://code.jquery.com/jquery-1.7.1.min.js'
                    ],
                    done: vow.callback
                });
            },
            'the title is Express' : function(errors, window) {
                //console.log(errors);
                if (errors){
                    throw(errors);
                }else{
                    var $ = window.$;
                    console.log($('.username').html());
                    assert.ok($('.username').html());
                }
            }
        }
    }
});
