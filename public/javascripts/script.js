/* Author: mrpix
*/
var options = {
    ns: { namespaces: ['translation'], defaultNs: 'translation'},
    useLocalStorage: false,
    resGetPath: 'locales/resources.json?lng=__lng__&ns=__ns__',
    dynamicLoad: true,
    sendMissing: true
}; 
$.i18n.init(options, function() { 
    //TODO: add more text
});    
// custom css expression for a case-insensitive contains()
jQuery.expr[':'].Contains = function(a,i,m){
    return (a.textContent || a.innerText || "").toUpperCase().indexOf(m[3].toUpperCase())>=0;
};
jQuery.extend(jQuery.expr[':'], { 
     containsExactly: "$(a).text() == m[3]" 
}); 
$(function() {    
    var list = $('#selectable');
    var vote = function(ev){
        ev.preventDefault();
        var a = $(this);
        var tr = a.parent().parent();
        var id = tr.attr('id');
        var nid = $('.details').attr('nid');
        var name = $('.details').find('legend').text();
        $.post("/nominations/vote", { id: nid, userid: id },
            function(data) {
                if (data){
                    console.log(data);
                    var votes = tr.find('.votes');
                    votes.html(data);
                }else{
                    alert("error");                            
                }
            }
        ).error(function(err) {console.log(err); alert("error"); });
        //TODO: check if exists already        
        var list = $('#voted');
        var found = list.find('li:containsExactly('+name+')');
        if (found.length < 1){
            var li = $('<li id="'+nid+'" type="voted"><input type="checkbox" /><label>'+name+'</label></li>');
            list.append(li);
            li.find("label").click(checkOne);
            li.find("input").click(checkOne);
        }
    };
    var erase = function(ev){
        ev.preventDefault();
        var a = $(this);
        var tr = a.parent().parent();
        var id = tr.attr('id');
        var name = tr.find('.name').text();
        var votes = tr.find('.votes').text();
        var nid = $('.details').attr('nid');
        var user = {
            _id : id,
            name : name,
            votes : votes
        };
        $.post("/nominations/eraseuser", { id: nid, user: user },
            function(data) {
                if (data){
                   tr.remove();
                }else{
                    alert("error");                            
                }
            }
        ).error(function(err) { alert("error erasing user"); });        
    };
    function loadUsers(next){
        $.getJSON(next || '/friends', function(data) {
            if (data.data.length > 0){
                $.each(data.data, function(key, value){
                    list.append('<li class="ui-state-default" id="'+value.id+'"><a>'+value.name+'</a></li>');
                });
                loadUsers(data.paging.next);
            }else{
                //console.log('finish');
            }
        }).error(function() { alert("error"); });
    }
    function loadNominations(type){
        $.getJSON('/nominations/'+type, function(data) {
            var list = $('#'+type);
            if (data.length < 1 ){
                    //console.log("no nominations");
            }else{
                $.each(data, function(key, value){
                    list.append('<li id="'+value._id+'" type="'+type+'"><input type="checkbox" /><label>'+value.name+'</label></li>');
                });
            }
            list.find("label").click(checkOne);
            list.find("input").click(checkOne);
        }).error(function() { alert("error"); });
    }
    function checkOne(){
        var currentEl = $(this);
        $("input:checked").each(function(){
            $(this).attr('checked', false);
        });
        if (currentEl.is('input')){ 
            currentEl.attr('checked', true);
            showNomination(currentEl.parent().attr('id'), currentEl.parent().attr('type'));
            return;
        }
        var checkbox = currentEl.siblings('input');
        checkbox.attr('checked', !checkbox.attr('checked'));
        showNomination(currentEl.parent().attr('id'), currentEl.parent().attr('type'));
    }
    function showNomination(id, type, refresh){
        //TODO: show avata       
        $.getJSON('/nominations/'+id, function(data) {
            var details = $('.details');
            details.attr('nid', data._id);
            details.find('legend').html(data.name);
            var daten = new Date(''+data.endDate);
            details.find('.date').html($.t('dashboard.end_date')+' '+ daten.getDate()+'/'+(daten.getMonth()+1)+'/'+daten.getUTCFullYear());
            details.find('.refresh').attr('nid', data._id);
            details.find('.refresh').attr('type', type);
            var ntype = type;
            //console.log(data._id);
            if (ntype === 'appear'){
                $('#end').hide();
                $('#cancel').hide();
                $('#remove').show();
            }else if (type === 'mine'){
                $('#end').show();
                $('#cancel').show();
                $('#remove').hide();
            }else{
                $('#end').hide();
                $('#cancel').hide();
                $('#remove').hide();
            }
            var tbody = details.find('.userst').find('tbody');
            tbody.html('');
            var userl = data.users.length;
            for (var i=0; i<userl;i++){
                var id = data.users[i]._id;
                var name = data.users[i].name;
                var votes = data.users[i].votes;
                var tr = $('<tr id="'+id+'"></tr>');
                tr.append('<td class="name">'+name+'</td>');
                tr.append('<td class="votes">'+votes+'</td>');
                var avote = $('<a class=".vote" href="#">Vote</a>');
                avote.click(vote);
                var aerase = $('<a class=".erase" href="#">Erase</a>');
                aerase.click(erase);
                var menu = $('<td></td>');
                menu.append(avote);
                menu.append(' / ');
                menu.append(aerase);
                menu.appendTo(tr);
                tbody.append(tr);
            }
            if (!refresh){
                details.show('slide');
            }            
        }).error(function() { alert("error"); });
    }
    $('.refresh').click(function(ev){
        ev.preventDefault();
        showNomination($(this).attr('nid'), $(this).attr('type'), 'refresh');
    });
    loadNominations('mine');
    loadNominations('appear');
    loadNominations('voted');
    loadUsers(null);
    var invited = $('.invited');
    if (invited[0]){
        showNomination(invited.attr('invited'), 'voted');
    }    
    $("#filterinput").change( function () {
        var filter = $(this).val();
        if(filter) {
            // this finds all links in a list that contain the input,
            // and hide the ones not containing the input while showing the ones that do
            list.find("a:not(:Contains(" + filter + "))").parent().slideUp();
            list.find("a:Contains(" + filter + ")").parent().slideDown();
        } else {
            list.find("li").slideDown();
        }
        return false;
    }).keyup( function () {
        // fire the above change event after every letter
        $(this).change();
    });
    $( "#datep" ).datepicker();
    $( "#selectable" ).selectable();
    $("#nn").click(function(){
        $( "#dialog-new" ).dialog( "open" );
    });
    $("#am").click(function(){
        $( "#dialog-add" ).dialog( "open" );
    });
    $( "#dialog-new" ).dialog({
        autoOpen: false,
		height: 300,
		width: 450,
		modal: true,
		buttons: {
			"Create a nomination": function() {
                var dialog = $(this);
                var name = dialog.find('#name').val();
                var datep = dialog.find('#datep').val();
                $.post("/nominations/create", { name: name, datep: datep },
                    function(data) {
                        var list = $('#mine');
                        var li = $('<li id="'+data._id+'" type="mine"><input type="checkbox" checked="true" /><label>'+data.name+'</label></li>');
                        list.append(li);
                        li.find("label").click(checkOne);
                        li.find("input").click(checkOne);
                        //showNomination(data._id);
                        li.find("label").trigger('click');
                        dialog.dialog( "close" );
                    }
                ).error(function() { alert("error"); });
			},
			Cancel: function() {
				$( this ).dialog( "close" );
			}
		},
		close: function() {
		    var dialog = $(this);
            dialog.find('#name').val('');
            dialog.find('#datep').val('');
		}
	});
    $( "#dialog-add" ).dialog({
        autoOpen: false,
		height: 300,
		width: 450,
		modal: true,
		buttons: {
			"Add friend(s)": function() {
                var dialog = $(this);
                var tbody = $('.details').find('.userst').find('tbody');
                //TODO: add to db
                var users = [];
                var userp;
                $('#selectable').find('.ui-selected').each(function(key, value){
                    users.push({
                        "_id" : $(value).attr('id'),
                        "name" : $(value).text(),
                        "votes" : 0
                    });                   
                });
                var ul = users.length;
                if (ul > 0 && ul <= 1){
                    userp = users[0];
                }else{
                    userp = users;
                }
                var nid = $('.details').attr('nid');
                $.post("/nominations/adduser", { id: nid, users: userp },
                    function(data) {
                        if (data){
                            $.each(users,function(key, value){
                                var id = value._id;
                                var name = value.name;
                                var tr = $('<tr id="'+id+'"></tr>');
                                tr.append('<td class="name">'+name+'</td>');
                                tr.append('<td class="votes">0</td>');
                                var avote = $('<a class=".vote" href="#">Vote</a>');
                                avote.click(vote);
                                var aerase = $('<a class=".erase" href="#">Erase</a>');
                                aerase.click(erase);
                                var menu = $('<td></td>');
                                menu.append(avote);
                                menu.append(' / ');
                                menu.append(aerase);
                                menu.appendTo(tr);
                                tbody.append(tr);                                
                            });
                            dialog.dialog( "close" );
                        }else{
                            dialog.dialog( "close" );
                            alert("error");                            
                        }
                    }
                ).error(function() { alert("error"); });				
			},
			Cancel: function() {
				$( this ).dialog( "close" );
			}
		},
		close: function() {
			//TODO:
		}
	});
    $('#cancel').click(function(ev){
        ev.preventDefault();
        var nid = $('.details').attr('nid');
        $.ajax({
            type: 'POST',
            url: '/nominations/erase',
            data: {id : nid},
            success: function(data){
                if (!data){ alert('error erasing'); /*TODO: show error*/ return;}
                alert('erased');
                $('#'+nid).remove();
                while($('#'+nid).length > 0){
                    $('#'+nid).remove();
                }
                $('.details').hide();
            },
            error: function(data){
                alert('error erasing');
            },
            dataType: 'json'
        });
    });
    $('#end').click(function(ev){
        ev.preventDefault();
        var nid = $('.details').attr('nid');
        $.ajax({
            type: 'POST',
            url: '/nominations/end',
            data: {id : nid},
            success: function(data){
                if (!data){ alert('error ending'); /*TODO: show error*/ return;}
                alert('erased');
                $('#'+nid).remove();
                while($('#'+nid).length > 0){
                    $('#'+nid).remove();
                }
                $('.details').hide();
            },
            error: function(data){
                alert('error erasing');
            },
            dataType: 'json'
        });
    });
    $('.vote').click(vote);
    $('.erase').click(erase);
});