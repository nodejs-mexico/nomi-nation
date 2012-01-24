//Copyright (C) 2011  Ivan Torres -MrPix
/* Author: mrpix
*/
var options = {
    ns: { namespaces: ['translation'], defaultNs: 'translation'},
    useLocalStorage: true,
    resGetPath: 'locales/resources.json?lng=__lng__&ns=__ns__',
    dynamicLoad: true
};
$.i18n.init(options, function() { 
    //TODO: add more text
});    
// expresion para buscar texto que contenga cierto termino
jQuery.expr[':'].Contains = function(a,i,m){
    return (a.textContent || a.innerText || "").toUpperCase().indexOf(m[3].toUpperCase())>=0;
};
// expresion para buscar texto que sea igual a otro
jQuery.extend(jQuery.expr[':'], { 
     containsExactly: "$(a).text() == m[3]" 
}); 
//mostrar mensajes modales
function showMsg(title, msg, extra){
    var dialog = $( "#dialog-modal" );
    dialog.attr('title', $.t(title));
    if (extra){
        dialog.find('#msg').text($.t(msg, {winner: extra}));
    }else{
        dialog.find('#msg').text($.t(msg));
    }    
    dialog.dialog('open');
}
$(function() {
    //instanciar dialogo
    $( "#dialog-modal" ).dialog({
        autoOpen: false,
        modal: true,
        buttons: {
            Ok: function() {
                $( this ).dialog( "close" );
            }
        }
    });
    //guardamos la lista para futuras referencias
    var list = $('#selectable');
    //funcion para votar por un usuario
    var vote = function(ev){
        $('.loading').show();
        ev.preventDefault();
        var a = $(this);
        var tr = a.parent().parent();
        var id = tr.attr('id');
        var nid = $('.details').attr('nid');
        var name = $('.details').find('legend').text();
        $.post("/nominations/vote", { id: nid, userid: id },
            function(data) {
                if (data){
                    var votes = tr.find('.votes');
                    votes.html(data);
                    var list = $('#voted');
                    var found = list.find('li:containsExactly('+name+')');
                    if (found.length < 1){
                        var li = $('<li id="'+nid+'" type="voted"><input type="checkbox" /><label>'+name+'</label></li>');
                        list.append(li);
                        li.find("label").click(checkOne);
                        li.find("input").click(checkOne);
                    }
                }else{
                    showMsg('dashboard.error', 'dashboard.error_voting');
                }
                $('.loading').hide();
            }
        ).error(function() {$('.loading').hide(); showMsg('dashboard.error', 'dashboard.error_voting'); });        
    };
    //funcion para borrar usuario
    var erase = function(ev){
        $('.loading').show();
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
                    showMsg('dashboard.error', 'dashboard.error_erasing_user');
                }
                $('.loading').hide();
            }
        ).error(function() { $('.loading').hide(); showMsg('dashboard.error', 'dashboard.error_erasing_user'); });
    };
    //cargando amigos del usuario en session
    var listi = $('#selectablei');
    function loadUsers(next){
        $.getJSON(next || '/friends', function(data) {
            if (data.data.length > 0){
                $.each(data.data, function(key, value){
                    list.append('<li class="ui-state-default" id="'+value.id+'"><img width="30px" src="https://graph.facebook.com/'+value.id+'/picture"/><a>'+value.name+'</a></li>');
                    listi.append('<li class="ui-state-default" id="'+value.id+'"><img width="30px" src="https://graph.facebook.com/'+value.id+'/picture"/><a>'+value.name+'</a></li>');
                });
                loadUsers(data.paging.next);
            }else{
                return;
            }
        }).error(function() { showMsg('dashboard.error', 'dashboard.error_friends'); });
    }
    //cargando nominaciones del usuario en session, depende del tipo
    function loadNominations(type){
        $('.loading').show();
        $.getJSON('/nominations/'+type, function(data) {
            var list = $('#'+type);
            if (data.length < 1 ){
                //showMsg('dashboard.warning', 'dashboard.warning_zarro');
            }else{
                $.each(data, function(key, value){
                    list.append('<li id="'+value._id+'" type="'+type+'"><input type="checkbox" /><label>'+value.name+'</label></li>');
                });
            }
            list.find("label").click(checkOne);
            list.find("input").click(checkOne);
            $('.loading').hide();
        }).error(function() { $('.loading').hide(); showMsg('dashboard.error', 'dashboard.warning_nominations'); });
    }
    //para q solo se puede seleccionar una nominacion a la vez
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
    //cargar la nominacion y llenar details
    function showNomination(id, type, refresh){
        $('.loading').show();
        $.getJSON('/nominations/'+id, function(data) {
            if (!data){
                //alert('Du! nominacion ya no existe o termino :(');
                showMsg('dashboard.warning', 'dashboard.warning_erased');
            }
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
                details.show('slide');
            }
            $('.loading').hide();
        }).error(function() { $('.loading').hide(); showMsg('dashboard.error', 'dashboard.error_showing'); });
    }
    //actualizar la nominacion en contexto
    $('.refresh').click(function(ev){
        ev.preventDefault();
        showNomination($(this).attr('nid'), $(this).attr('type'), 'refresh');
    });
    //cargar las nominaciones y usuarios
    loadNominations('mine');
    loadNominations('appear');
    loadNominations('voted');
    loadUsers(null);
    //viene referenciado, mostrar esa nominacion
    var invited = $('.invited');
    if (invited[0]){
        showNomination(invited.attr('invited'), 'voted');
    }
    //para filtrar la lista de amigos
    $("#filterinput").change( function () {
        var filter = $(this).val();
        if(filter) {
            // this finds all links in a list that contain the input,
            // and hide the ones not containing the input while showing the ones that do
            list.find("a:not(:Contains(" + filter + "))").parent().hide();
            list.find("a:Contains(" + filter + ")").parent().show();
        } else {
            list.find("li").show();
        }
        return false;
    }).keyup( function () {
        // fire the above change event after every letter
        $(this).change();
    });
    $("#filterinputi").change( function () {
        var filter = $(this).val();
        if(filter) {
            // this finds all links in a list that contain the input,
            // and hide the ones not containing the input while showing the ones that do
            listi.find("a:not(:Contains(" + filter + "))").parent().hide();
            listi.find("a:Contains(" + filter + ")").parent().show();
        } else {
            listi.find("li").show();
        }
        return false;
    }).keyup( function () {
        // fire the above change event after every letter
        $(this).change();
    });
    //inicializar el seleccionador de fecha
    $( "#datep" ).datepicker();
    //hacer seleccionable la lista de usuarios
    $( "#selectable" ).selectable();
    $( "#selectablei" ).selectable();
    //abrir el dialog de nueva nominacion
    $("#nn").click(function(){
        $( "#dialog-new" ).dialog( "open" );
    });
    //abrir el dialogo de agregar usuarios
    $("#am").click(function(){
        $( "#dialog-add" ).dialog( "open" );
    });
    //creamos el dialogo de nueva nominacion
    $( "#dialog-new" ).dialog({
        autoOpen: false,
        height: 300,
		width: 450,
		modal: true,
		buttons: {
            //TODO: put a t string :S
			"Create a nomination": function() {
                $('.loading').show();
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
                        li.find("label").trigger('click');
                        dialog.dialog( "close" );
                        $('.loading').hide();
                    }
                ).error(function() { $('.loading').hide(); showMsg('dashboard.error', 'dashboard.warning_creating'); });
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
    //creamos el dialog de agregar usuarios
    $( "#dialog-add" ).dialog({
        autoOpen: false,
		height: 300,
		width: 450,
		modal: true,
		buttons: {
			"Add friend(s)": function() {
                $('.loading').show();
                var dialog = $(this);
                var tbody = $('.details').find('.userst').find('tbody');
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
                                tr.append('<td class="pic"><img width="20px" src="https://graph.facebook.com/'+id+'/picture"/></td>');
                                tr.append('<td class="name">'+name+'</td>');
                                tr.append('<td class="votes">0</td>');
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
                            });                            
                            dialog.dialog( "close" );
                        }else{
                            dialog.dialog( "close" );
                            showMsg('dashboard.error', 'dashboard.error_adduser');
                        }
                        $('.loading').hide();
                    }
                ).error(function() { $('.loading').hide(); showMsg('dashboard.error', 'dashboard.error_adduser'); });				
			},
			Cancel: function() {
				$( this ).dialog( "close" );
			}
		},
		close: function() {
			//TODO:
		}
	});
    //creamos el dialog de agregar usuarios
    $( "#dialog-invite" ).dialog({
        autoOpen: false,
        height: 300,
		width: 450,
		modal: true,
		buttons: {
			"Invite friend(s)": function() {
                $('.loading').show();
                var dialog = $(this);
                var users = [];
                var userp;
                $('#selectablei').find('.ui-selected').each(function(key, value){
                    users.push({
                        "_id" : $(value).attr('id'),
                        "name" : $(value).text()
                    });                   
                });
                var ul = users.length;
                if (ul > 0 && ul <= 1){
                    userp = users[0];
                }else{
                    userp = users;
                }
                $.post("/invite", { users: userp },
                    function(data) {
                        if (data){
                            showMsg('dashboard.warning', 'dashboard.invited'); 
                            dialog.dialog( "close" );
                        }else{
                            dialog.dialog( "close" );
                            showMsg('dashboard.error', 'dashboard.warning_invited');
                        }
                        $('.loading').hide();
                    }
                ).error(function() { $('.loading').hide(); showMsg('dashboard.warning', 'dashboard.warning_invited'); });				
			},
			Cancel: function() {
				$( this ).dialog( "close" );
			}
		},
		close: function() {
			//TODO:
		}
	});
    //para cancelar nominacion
    $('#cancel').click(function(ev){
        $('.loading').show();
        ev.preventDefault();
        var nid = $('.details').attr('nid');
        $.ajax({
            type: 'POST',
            url: '/nominations/erase',
            data: {id : nid},
            success: function(data){
                if (!data){ showMsg('dashboard.error', 'dashboard.error_erasing'); return;}
                showMsg('dashboard.warning', 'dashboard.warning_erasing');
                $('#'+nid).remove();
                while($('#'+nid).length > 0){
                    $('#'+nid).remove();
                }
                $('.details').hide();
                $('.loading').hide();
            },
            error: function(){
                showMsg('dashboard.error', 'dashboard.error_erasing');
                $('.loading').hide();
            },
            dataType: 'json'
        });
    });
    //para terminar nominacion
    $('#end').click(function(ev){
        $('.loading').show();
        ev.preventDefault();
        var nid = $('.details').attr('nid');
        $.ajax({
            type: 'POST',
            url: '/nominations/end',
            data: {id : nid},
            success: function(data){
                if (!data){ showMsg('dashboard.error', 'dashboard.error_ending'); return;}
                if (data === true){ showMsg('dashboard.warning','dashboard.win', 'no users :('); };
                showMsg('dashboard.warning','dashboard.win', data.name);
                $('#'+nid).remove();
                while($('#'+nid).length > 0){
                    $('#'+nid).remove();
                }
                $('.details').hide();
                $('.loading').hide();
            },
            error: function(){
                showMsg('dashboard.error', 'dashboard.error_ending');
                $('.loading').hide();
            },
            dataType: 'json'
        });
    });
    //para remover al usuario actual de la nominacion
    $('#remove').click(function(ev){
        $('.loading').show();
        ev.preventDefault();
        var uid = $(this).attr('uid');
        var nid = $('.details').attr('nid');        
        $.post("/nominations/eraseuser", { id: nid, user: 'eraseme' },
            function(data) {
                if (data){                    
                    //get the row of the user and erase it
                   $('.details').find('#'+uid).remove();
                }else{
                    showMsg('dashboard.error', 'dashboard.error_removing');
                }
                $('.loading').hide();
            }
        ).error(function() { $('.loading').hide(); showMsg('dashboard.error', 'dashboard.error_removing'); }); 
    });
    //escuchar por los clicks en votar y borrar
    $('.vote').click(vote);
    $('.erase').click(erase);
    $('#sf').submit(function(){
        var searchTerm = $('#sf').find('.search').val();
        if (searchTerm){
            $('.loading').show();
            $.post("/nominations/search", { term: searchTerm },
                function(data) {
                    if (data){                    
                        //TODO: show the list
                        console.log(data);
                       
                    }else{
                        showMsg('dashboard.error', 'dashboard.error_searching');
                    }
                    $('.loading').hide();
                }
            ).error(function() { $('.loading').hide(); showMsg('dashboard.error', 'dashboard.error_searching'); }); 
        }
        return false;
    });
    $('.invite').click(function(){
        $( "#dialog-invite" ).dialog( "open" );
    });
});