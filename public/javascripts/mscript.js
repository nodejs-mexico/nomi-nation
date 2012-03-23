function loadUsers(next){
    $.getJSON(next || 'http://nomination.cloudno.de/friends', function(data) {
    if (data.data.length > 0){
	    var list = $('#lof');
	    $.each(data.data, function(key, value){
		list.append('<input type="checkbox" name="'+value.name+'" id="'+value.id+'" />');
		list.append('<label for="'+value.id+'">'+value.name+'</label>');
	    });
	    $('#lof').trigger( 'updatelayout' );
	    loadUsers(data.paging.next);
	}else{
	    return;
	}
    }).error(function() { showMsg('dashboard.error', 'dashboard.error_friends'); });
}
Date.prototype.setISO8601 = function (string) {
    var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
        "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
        "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
    var d = string.match(new RegExp(regexp));

    var offset = 0;
    var date = new Date(d[1], 0, 1);

    if (d[3]) { date.setMonth(d[3] - 1); }
    if (d[5]) { date.setDate(d[5]); }
    if (d[7]) { date.setHours(d[7]); }
    if (d[8]) { date.setMinutes(d[8]); }
    if (d[10]) { date.setSeconds(d[10]); }
    if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
    if (d[14]) {
        offset = (Number(d[16]) * 60) + Number(d[17]);
        offset *= ((d[15] == '-') ? 1 : -1);
    }

    offset -= date.getTimezoneOffset();
    var time = (Number(date) + (offset * 60 * 1000));
    this.setTime(Number(time));
};
$( document ).bind( "mobileinit", function() {
    // Make your jQuery Mobile framework configuration changes here!
    $.mobile.touchOverflowEnabled = true;
    $.mobile.allowCrossDomainPages = true;
});
function onLoad(){
    document.addEventListener("deviceready", onDeviceReady, true);
}
function onDeviceReady(){
    
}
function loadNominations(type){
	$.mobile.showPageLoadingMsg();
    $.getJSON('http://nomination.cloudno.de/nominations/'+type, function(data) {
        var list = $('#'+type);
        if (data.length < 1 ){
            //showMsg('dashboard.warning', 'dashboard.warning_zarro');
        }else{
            $.each(data, function(key, value){
                list.append('<li id="'+value._id+'" type="'+type+'"><a class="details" href="#">'+value.name+'</a></li>');
            });
            list.listview('refresh');
        }
        $.mobile.hidePageLoadingMsg();
    }).error(function() { $.mobile.hidePageLoadingMsg(); showMsg('dashboard.error', 'dashboard.warning_nominations'); });
}
$('#dashboard-mine').live('pagecreate', function(){	
    loadNominations('mine');
    loadUsers(null);
});
$('#dashboard-voted').live('pagecreate', function(){	
    loadNominations('voted');
});
$('#dashboard-appear').live('pagecreate', function(){	
    loadNominations('appear');
});
function swipe(){
    // reference the just swiped list item
    var $li = $(this);
    // remove all buttons first
    $('.aDeleteBtn').remove();
    $('.aVoteBtn').remove();
	// create buttons and div container
	var $deleteBtn = $('<a>Delete</a>').attr({
			'class': 'aDeleteBtn ui-btn-up-r',
			'href': 'some/link/page.html?nID=' + $li.data('nid')
		});
    var $voteBtn = $('<a>Vote</a>').attr({
            'class': 'aVoteBtn ui-btn-up-bl',
			'href': 'some/link/page.html?nID=' + $li.data('nid')
		});
	// insert swipe div into list item
    //TODO: what to do on click function
	$li.prepend($deleteBtn);
    $li.prepend($voteBtn);
    $deleteBtn.slideToggle();
    $voteBtn.slideToggle();
}
function showMsg(err, msg){
	var dialog = $("#popup");
	dialog.find("#title").html(err);
	dialog.find("#msg").html(msg);
	$.mobile.changePage( dialog );
}
//cargar la nominacion y llenar details
function showNomination(id, type, refresh){
    $.mobile.showPageLoadingMsg();
    $.getJSON('http://nomination.cloudno.de/nominations/'+id, function(data) {
        if (!data){
            //alert('Du! nominacion ya no existe o termino :(');
            showMsg('dashboard.warning', 'dashboard.warning_erased');
        }
        var details = $('#details');
        details.find('#attd').attr('nid',id);
        details.find('#attd').attr('type',type);
        details.find('.name').html(data.name);
        var daten = new Date();
        daten.setISO8601(data.endDate);
        details.find('.endD').html( daten.getDate()+'/'+(daten.getMonth()+1)+'/'+daten.getUTCFullYear());
        //details.find('.refresh').attr('nid', data._id);
        //details.find('.refresh').attr('type', type);
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
        var usersl = details.find('.users');
        usersl.html('');
        var userl = data.users.length;
        usersl.hide();
        usersl.append('<li data-role="list-divider">Swipe to Vote/Delete</li>');
        for (var i=0; i<userl;i++){
			usersl.append('<li id="'+data.users[i]._id+'" type="'+type+'">'+
				'<img src="https://graph.facebook.com/'+data.users[i]._id+'/picture"/>'+
                data.users[i].name+
                '<span class="ui-li-count count">'+data.users[i].votes+'</span></li>');
        }
        usersl.listview('refresh');
        usersl.show();
        $('.users li').bind('swiperight', swipe);
        /*var tbody = details.find('.userst').find('tbody');
        tbody.html('');
        var userl = data.users.length;
        for (var i=0; i<userl;i++){
            var id = data.users[i]._id;
            var name = data.users[i].name;
            var votes = data.users[i].votes;
            var tr = $('<tr id="'+id+'"></tr>');
            tr.append('<td class="pic"><img width="20px" src="https://graph.facebook.com/'+id+'/picture"/></td>');
            tr.append('<td class="name">'+name+'</td>');
            tr.append('<td class="votes">'+votes+'</td>');
            var avote = $('<a class=".vote" href="#">'+$.t('dashboard.vote')+'</a>');
            avote.click(vote);
            var aerase = $('<a class=".erase" href="#">'+$.t('dashboard.erase')+'</a>');
            aerase.click(erase);
            var menu = $('<td></td>');
            menu.append(avote);
            menu.append(' / ');
            menu.append(aerase);
            menu.appendTo(tr);
            tbody.append(tr);
        }
        if (!refresh){
            //details.show('slide');
        }*/
        $.mobile.hidePageLoadingMsg();
    }).error(function() {
        $.mobile.hidePageLoadingMsg();
        showMsg('dashboard.error', 'dashboard.error_showing'); 
    });
}
$('.details').live('click', function(){
	$.mobile.showPageLoadingMsg();
	var li = $(this).parents('li');
	var id = li.attr('id');
	var type = li.attr('type');
	$('#details').find('#attd').attr('past',$.mobile.activePage.attr('id'));
	showNomination(id, type, false);
	$.mobile.changePage($("#details"));
});
$('.create').live('click', function(){
    $.mobile.changePage( "#newn", { transition: "pop"} );
});
$('#newnfs').live('click', function(ev){
    ev.preventDefault();
    $.mobile.showPageLoadingMsg();
    var name = $('#name').val();
    var date = $('#date').val();
    if (name!=='' && date !==''){
	//date = new Date(date.replace(/-/gi, "/"));
	$('#errornf').html('');
	$.post("http://nomination.cloudno.de/nominations/create", { name: name, datep: date },
	    function(data) {
            var list = $('#mine');
            list.append('<li id="' + 
                data._id + '" type="mine"><a class="details" href="#">' + 
                data.name + '</a></li>');
            list.listview('refresh');
            $.mobile.hidePageLoadingMsg();
            $.mobile.changePage( "#dashboard-mine" );
            return false;
	    }
	).error(function() {
	    $.mobile.hidePageLoadingMsg();
	    $('#errornf').html('Error saving the nomination, try again later');
	    return false;
	});
	return false;
    }else{
	$('#errornf').html('Name and date required');
	$.mobile.hidePageLoadingMsg();
	return false;
    }
});
$('#adduser').live('click', function(){
    $.mobile.changePage( "#addf",
	{
	    transition: "pop",
	    reverse: false,
	    changeHash: false
	});
});
$('#bina').live('click', function(){
    $.mobile.changePage( "#details" );
});
$('.add').live('click', function(){
    $.mobile.showPageLoadingMsg();
    var users = [];
    var userp;
    $('#lof').find(':checked').each(function(){
        users.push({
            "_id" : $(this).attr('id'),
            "name" : $(this).attr('name'),
            "votes" : 0
        });
    });
    var ul = users.length;
    if (ul > 0 && ul <= 1){
	    userp = users[0];
    }else{
	    userp = users;
    }
    var details = $('#details');
    var nid = details.find('#attd').attr('nid');
    var type = details.find('#attd').attr('type');
    $.post("http://nomination.cloudno.de/nominations/adduser", { id: nid, users: userp },
	function(data) {
	    if (data){
            $.each(users,function(key, value){
                var usersl = details.find('.users');
                usersl.append('<li id="'+value._id+'" type="'+type+'">'+
                    '<img src="https://graph.facebook.com/'+value._id+'/picture"/>'+
                    value.name+
                    '<span class="ui-li-count count">0</span></li>');
                usersl.listview('refresh');
            });
            $.mobile.changePage( "#details" );
	    }else{
		    $.mobile.changePage( "#details" );
		    showMsg('dashboard.error', 'dashboard.error_adduser');
	    }
	    $.mobile.hidePageLoadingMsg();
	}).error(function() { 
        $.mobile.hidePageLoadingMsg(); 
        showMsg('dashboard.error', 'dashboard.error_adduser'); 
    });
});
$('#cancel').live('click', function(){
    $.mobile.showPageLoadingMsg();
    var details = $('#details');
    var nid = details.find('#attd').attr('nid');
    var past = details.find('#attd').attr('past');
    $.ajax({
	type: 'POST',
	url: 'http://nomination.cloudno.de/nominations/erase',
	data: {id : nid},
	success: function(data){
	    if (!data){ showMsg('dashboard.error', 'dashboard.error_erasing'); return;}
	    $('#'+nid).remove();
	    while($('#'+nid).length > 0){
		$('#'+nid).remove();
	    }
	    $.mobile.hidePageLoadingMsg();
	    $.mobile.changePage( '#'+past );
	},
	error: function(){
	    showMsg('dashboard.error', 'dashboard.error_erasing');
	    $.mobile.hidePageLoadingMsg();
	},
	dataType: 'json'
    });
});
$('#end').live('click', function(){
    $.mobile.showPageLoadingMsg();
    var details = $('#details');
    var nid = details.find('#attd').attr('nid');
    var past = details.find('#attd').attr('past');
    $.ajax({
	type: 'POST',
	url: 'http://nomination.cloudno.de/nominations/end',
	data: {id : nid},
	success: function(data){
	    if (!data){ showMsg('dashboard.error', 'dashboard.error_ending'); return;}
	    if (data === true){ showMsg('dashboard.warning','dashboard.no_users'); }
	    $('#'+nid).remove();
	    while($('#'+nid).length > 0){
		$('#'+nid).remove();
	    }
	    $.mobile.hidePageLoadingMsg();
	    $.mobile.changePage( '#'+past );
	},
	error: function(){
	    showMsg('dashboard.error', 'dashboard.error_ending');
	    $.mobile.hidePageLoadingMsg();
	},
	dataType: 'json'
    });
});