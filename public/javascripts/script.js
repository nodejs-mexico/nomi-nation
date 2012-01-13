/* Author: mrpix

*/
$(function() {
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
				$( this ).dialog( "close" );
			},
			Cancel: function() {
				$( this ).dialog( "close" );
			}
		},
		close: function() {
			//TODO:
		}
	});
    $( "#dialog-add" ).dialog({
        autoOpen: false,
		height: 300,
		width: 450,
		modal: true,
		buttons: {
			"Add friend(s)": function() {
				$( this ).dialog( "close" );
			},
			Cancel: function() {
				$( this ).dialog( "close" );
			}
		},
		close: function() {
			//TODO:
		}
	});
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
    function checkOne(){
        var currentEl = $(this);
        $("input:checked").each(function(){
            $(this).attr('checked', false);
        });
        if (currentEl.is('input')){ 
            currentEl.attr('checked', true);
            return;
        }
        var checkbox = currentEl.siblings('input');
        checkbox.attr('checked', !checkbox.attr('checked'));
    }
    $(".nominations ul label").click(checkOne);
    $(".nominations ul input").click(checkOne);
});