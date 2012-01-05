/**
 * 
 * Test index route
*/
var vows = require('vows'),
    assert = require('assert'),
    zombie = require('zombie'),
    jsdom = require('jsdom');
    
exports.index = vows.describe('Visiting index').addBatch({
    'when hitting the page': {
        topic: function(){
            zombie.visit('http://nomi-nation.pinguxx.cloud9ide.com',this.callback);
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
                    assert.equal('Express', $('title').html());
                }
            }
        }
    }
});
