var options = {
    ns: { namespaces: ['translation'], defaultNs: 'translation'},
    useLocalStorage: true,
    resGetPath: 'locales/resources.json?lng=__lng__&ns=__ns__',
    dynamicLoad: true
};
$.i18n.init(options, function() { 
    //TODO: add more text
});
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
        //list.find("label").click(checkOne);
        //list.find("input").click(checkOne);
        $.mobile.hidePageLoadingMsg();
    }).error(function() { $.mobile.hidePageLoadingMsg(); showMsg('dashboard.error', 'dashboard.warning_nominations'); });
}
$('#dashboard-mine').live('pagecreate', function(event){	
	loadNominations('mine');
});
$('#dashboard-voted').live('pagecreate', function(event){	
    loadNominations('voted');
});
$('#dashboard-appear').live('pagecreate', function(event){	
    loadNominations('appear');
});
function swipe(e){
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
function showMsg(title, msg){
	var dialog = $("#popup");
	dialog.find("#title").html($.t(title));
	dialog.find("#msg").html($.t(msg));
	$.mobile.changePage( dialog );
}
//cargar la nominacion y llenar details
function showNomination(id, type, refresh){
	$.mobile.showPageLoadingMsg();
    $.getJSON('http://nomination.cloudno.de/nominations/'+id, function(data) {
        console.log(data);
        if (!data){
            //alert('Du! nominacion ya no existe o termino :(');
            showMsg('dashboard.warning', 'dashboard.warning_erased');
        }
        var details = $('#details');
        details.find('.name').html(data.name);
        console.log(data.endDate);
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
        for (var i=0; i<userl;i++){
            usersl.append('<li id="'+data.users[i]._id+'" type="'+type+'">'+
                '<img src="https://graph.facebook.com/'+data.users[i]._id+'/picture"/>'+
                data.users[i].name+
                '<span class="ui-li-count count">'+data.users[i].votes+'</span></li>');
        }
        usersl.listview('refresh');
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
    }).error(function(err) {
        $.mobile.hidePageLoadingMsg();
        showMsg('dashboard.error', 'dashboard.error_showing'); 
    });
}
$('.details').live('click', function(ev){
	$.mobile.showPageLoadingMsg();
	var li = $(this).parents('li');
	var id = li.attr('id');
	var type = li.attr('type');
	showNomination(id, type, false);
	$.mobile.changePage($("#details"));
});