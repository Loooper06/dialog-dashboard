/*****************************************************************************************
 * Template Name: Dialog - Admin Dashboard Based On Bootstrap
 * Author: WiCard team
 * Note: In this file there are functions that by calling them you can do many things without coding.
		 It was explained at the top of each function.
*****************************************************************************************/



/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= 
	By this functions you can save options in localstorage or set them in page elements
=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
function ToBoolean(v) {
	if (v == 'true') 	var x = 1;
	if (v == 'false')	var x = 0;
	return x;
};

function SaveOptions(){

	if(typeof Storage !== "undefined") {

		// colors
		localStorage.FC = $('body').attr('id');							// full color (FC)
		localStorage.TC = $('#top-navbar').attr('style'); 				// topbar color
		localStorage.MC = $('#sidebar').css('color');					// menu text color
		localStorage.MB = $('#sidebar').css('background-image');		// menu background
		if ( localStorage.MB == 'none' ) 
			localStorage.MB = $('#sidebar').css('background-color');

		// top bar
		localStorage.TF = $('#topfix').prop("checked");					// topbar fix

		// content
		localStorage.CB = $('#content').css('background-image');		// content background
		localStorage.BB = $('body').css('background-image');			// body background
		localStorage.BL = $('#box_option').prop("checked");				// boxed layout
		localStorage.NM = $('#nightmode').prop("checked");				// night mode

		// menu
		localStorage.MP = $('#m_orient').val();							// menu position
		localStorage.SW = $('#side_w_s').slider('option','value');		// width of sidebar

		// columns
		localStorage.PC = $('#corners_s').slider('option','value');		// panel corner

		// for first option saving
		localStorage.FirstSave = 'yes';
	}
	else {
		// or set cookie
	}
};

function SetOptions() {

	if(typeof Storage !== 'undefined' && localStorage.FirstSave == 'yes') { 

		// theme full colors
		$('body').attr("id", localStorage.FC );

		// top bar color
		$('#top-navbar').attr( 'style', localStorage.TC );

		// top bar floating
		$('#topfix').prop( 'checked', ToBoolean(localStorage.TF) );

		// content
		$('#content').css( {'background-image':localStorage.CB} );
		$('body').css( {'background-image':localStorage.BB} );
		$('#box_option').prop( 'checked', ToBoolean(localStorage.BL) );
		$('#nightmode').prop( 'checked', ToBoolean(localStorage.NM) );


		// menu orientation
		$('#m_orient').val(localStorage.MP).change();

		// menu color
		$('#sidebar, .StickySidebar').css("background", localStorage.MB );
		$('#sidebar').css("color", localStorage.MC );

		// menu width
		$('#side_width_txt').html( localStorage.SW + 'px' );
		$('#sidebar, .theiaStickySidebar').css({'width': localStorage.SW});
		$("#side_w_s").slider({value: localStorage.SW}); 


		// panel corners
		var corner = localStorage.PC + 'px';
		$('#corners_txt').html( corner );
		$('.panel').css({'border-radius': corner});
		$('.panel-heading').css({'border-top-left-radius': corner, 'border-top-right-radius': corner});
		$('.panel-footer').css({'border-bottom-left-radius': corner, 'border-bottom-right-radius': corner});
		$("#corners_s").slider({value: localStorage.PC}); 

	}
	else {
	  // or set cookie
	}

	// necessary functions
	Option_switches();
	cc_fColorClass(6);
};





/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= 
	This function check the switch option's switch and regard to their states change the items on screen.
=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
function Option_switches() {
	// fixed top bar
	if($('#topfix').prop("checked")) {
		$('#top-navbar').css({'position':'fixed'});
	}
	else {
		$('#top-navbar').css({'position':'absolute'});
	};


	// Boxet layout
	if($('#box_option').prop("checked")) {
		$('body').removeClass('container-fluid').addClass('container-md');
		var sb = Math.round(($('html').width() - $('body').width()) / 2 + 1);
		$('#sidebar').css({'right' : sb});
	}
	else {
		$('body').removeClass('container-md').addClass('container-fluid');
		$('#sidebar').css({'right' : '0px'});
	};


	// night mode colors
	if($('#nightmode').prop("checked")) {
		$('body').addClass('night-mode');
	}
	else {
		$('body').removeClass('night-mode');
	};
};




/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= 
	By calling this function you can set distance header padding and sidebars in any situation.
=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
function SetPaddings() {

	var W = $(window).width();
	var S = $('#sidebar');
	var Sw = $('#sidebar').width();
	var T = $('#topfix');
	var SId = $('.StickySidebar').attr('id');

	// main content and body
	if ( SId == 'menu_ver' && S.hasClass("is-open") && W>992 ) {
		$('.main_content').css({'padding-right': Sw});
	}
	else {
		$('.main_content').css({'padding-right':'0px'});
	};

	// content
	if( S.hasClass("is-open") && SId=='menu_hor' ) {
		$('#content').css({'padding-top':'112px'});
	}
	else {
		$('#content').css({'padding-top':'63px'});
	};

	// sidebar
	if( !T.prop('checked') && S.hasClass("is-open") && SId=='menu_hor') {
		$('#sidebar').css({'padding-top':'0px'});
	}
	else {
		$('#sidebar').css({'padding-top':'63px'});
	};

	// header and side panel
	if ( !T.prop('checked') && S.hasClass("is-open") && SId=='menu_hor' && W>992 ) {
		$('header#top-navbar').css({'top':'42px','z-index':'90'});
		$('#side_panel').css({'top':'104px'});
	}
	else {
		$('header#top-navbar').css({'top':'0px','z-index':'93'});
		$('#side_panel').css({'top':'64px'});
	};


	if ( W > 970 ) {
		$('#menu_hor ul').removeAttr('style');
	}
};




/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= 
	Toggle full screen mode
=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
function FullScreen() {
	document.fullScreenElement && null !== document.fullScreenElement || !document.mozFullScreen && !document.webkitIsFullScreen ? document.documentElement.requestFullScreen ? document.documentElement.requestFullScreen() : 
	document.documentElement.mozRequestFullScreen ? document.documentElement.mozRequestFullScreen() : 
	document.documentElement.webkitRequestFullScreen && document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT) : 
	document.cancelFullScreen ? document.cancelFullScreen() : 
	document.mozCancelFullScreen ? document.mozCancelFullScreen() : 
	document.webkitCancelFullScreen && document.webkitCancelFullScreen()
};




/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= 
	This function scroll to the last chat message box at the right Thus,
	after loading each message must call this function.
=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
function ChatScroller() {
	var height = 0;
	$('#user_message>div').each(function(i, value) {
		height += parseInt($(this).height());
	});
	height += '';
	$('.tower-body').animate({scrollTop: height});
};




/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= 
	This function sets chat tower height
=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
function chat_height() {
	var Brheight = $(window).height();
	$('.tower-body.js-control').css({'height':Brheight-310});
}




/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= 
	The function according to the type of Progress Bar and filling percentage 
	give appropriate color to the bootstrap progressbars.
=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
function ProgressBars() {
	/* progress bar auto coloring */
	$( ".pr-good .progress-bar" ).each(function() {

		$(this).removeClass (function (index, css) {
			return (css.match (/(^|\s)bg-\S+/g) || []).join(' ');
		});

		var P = $(this).width() / $(this).parent().width() * 100;

		if (P <= 25) {
			$(this).addClass('bg-danger');
		};
		if (P > 25 && P <= 50) {
			$(this).addClass('bg-warning');
		};
		if (P > 50 && P <= 75) {
			$(this).addClass('bg-info');
		};
		if (P > 75) {
			$(this).addClass('bg-success');
		};
	});

	$( ".pr-bad .progress-bar" ).each(function() {

		$(this).removeClass (function (index, css) {
			return (css.match (/(^|\s)bg-\S+/g) || []).join(' ');
		});

		var P = $(this).width() / $(this).parent().width() * 100;

		if (P <= 25) {
			$(this).addClass('bg-success');
		};
		if (P > 25 && P <= 50) {
			$(this).addClass('bg-info');
		};
		if (P > 50 && P <= 75) {
			$(this).addClass('bg-warning');
		};
		if (P > 75) {
			$(this).addClass('bg-danger');
		};
	});

};
	



/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= 
	Multi level menu tree 
=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
$.fn.extend({
	treed: function (o) {

		var openedClass;
		var closedClass;

		openedClass = o.openedClass;
		closedClass = o.closedClass;

		var tree = $(this);
		tree.find('li').has("ul").each(function () {
			var branch = $(this); //li with children ul
			branch.prepend("<i class='indicator la " + closedClass + "'></i>");
			branch.addClass('branch');
			branch.on('click', function (e) {
				if (this == e.target) {
					var icon = $(this).children('i:first');
					icon.toggleClass(openedClass + " " + closedClass);
					$(this).children().children().toggle();
				}
			})
			branch.children().children().toggle();
		});

		tree.find('.branch .indicator').each(function(){
			$(this).on('click', function () {
				$(this).closest('li').click();
			});
		});

		tree.find('.branch>a').each(function () {
			$(this).on('click', function (e) {
				$(this).closest('li').click();
				e.preventDefault();
			});
		});
	}
});



/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= 
	To shamsi converter 
=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
function formatShamsiCalender(date){
	week = new Array("يكشنبه", "دوشنبه", "سه شنبه", "چهارشنبه", "پنج شنبه", "جمعه", "شنبه")
	months = new Array("فروردين", "ارديبهشت", "خرداد", "تير", "مرداد", "شهريور", "مهر", "آبان", "آذر", "دي", "بهمن", "اسفند");
	d = date.getDay();
	day = date.getDate();
	month = date.getMonth() + 1;
	year = date.getYear();
	year = (window.navigator.userAgent.indexOf('MSIE') > 0) ? year : 1900 + year;
	if (year == 0) {
		year = 2000;
	}
	if (year < 100) {
		year += 1900;
	}
	y = 1;
	for (i = 0; i < 3000; i += 4) {
		if (year == i) {
			y = 2;
		}
	}
	for (i = 1; i < 3000; i += 4) {
		if (year == i) {
			y = 3;
		}
	}
	if (y == 1) {
		year -= ((month < 3) || ((month == 3) && (day < 21))) ? 622 : 621;
		switch (month) {
			case 1:
				(day < 21) ? (month = 10, day += 10) : (month = 11, day -= 20);
				break;
			case 2:
				(day < 20) ? (month = 11, day += 11) : (month = 12, day -= 19);
				break;
			case 3:
				(day < 21) ? (month = 12, day += 9) : (month = 1, day -= 20);
				break;
			case 4:
				(day < 21) ? (month = 1, day += 11) : (month = 2, day -= 20);
				break;
			case 5:
			case 6:
				(day < 22) ? (month -= 3, day += 10) : (month -= 2, day -= 21);
				break;
			case 7:
			case 8:
			case 9:
				(day < 23) ? (month -= 3, day += 9) : (month -= 2, day -= 22);
				break;
			case 10:
				(day < 23) ? (month = 7, day += 8) : (month = 8, day -= 22);
				break;
			case 11:
			case 12:
				(day < 22) ? (month -= 3, day += 9) : (month -= 2, day -= 21);
				break;
			default:
				break;
		}
	}
	if (y == 2) {
		year -= ((month < 3) || ((month == 3) && (day < 20))) ? 622 : 621;
		switch (month) {
			case 1:
				(day < 21) ? (month = 10, day += 10) : (month = 11, day -= 20);
				break;
			case 2:
				(day < 20) ? (month = 11, day += 11) : (month = 12, day -= 19);
				break;
			case 3:
				(day < 20) ? (month = 12, day += 10) : (month = 1, day -= 19);
				break;
			case 4:
				(day < 20) ? (month = 1, day += 12) : (month = 2, day -= 19);
				break;
			case 5:
				(day < 21) ? (month = 2, day += 11) : (month = 3, day -= 20);
				break;
			case 6:
				(day < 21) ? (month = 3, day += 11) : (month = 4, day -= 20);
				break;
			case 7:
				(day < 22) ? (month = 4, day += 10) : (month = 5, day -= 21);
				break;
			case 8:
				(day < 22) ? (month = 5, day += 10) : (month = 6, day -= 21);
				break;
			case 9:
				(day < 22) ? (month = 6, day += 10) : (month = 7, day -= 21);
				break;
			case 10:
				(day < 22) ? (month = 7, day += 9) : (month = 8, day -= 21);
				break;
			case 11:
				(day < 21) ? (month = 8, day += 10) : (month = 9, day -= 20);
				break;
			case 12:
				(day < 21) ? (month = 9, day += 10) : (month = 10, day -= 20);
				break;
			default:
				break;
		}
	}
	if (y == 3) {
		year -= ((month < 3) || ((month == 3) && (day < 21))) ? 622 : 621;
		switch (month) {
			case 1:
				(day < 20) ? (month = 10, day += 11) : (month = 11, day -= 19);
				break;
			case 2:
				(day < 19) ? (month = 11, day += 12) : (month = 12, day -= 18);
				break;
			case 3:
				(day < 21) ? (month = 12, day += 10) : (month = 1, day -= 20);
				break;
			case 4:
				(day < 21) ? (month = 1, day += 11) : (month = 2, day -= 20);
				break;
			case 5:
			case 6:
				(day < 22) ? (month -= 3, day += 10) : (month -= 2, day -= 21);
				break;
			case 7:
			case 8:
			case 9:
				(day < 23) ? (month -= 3, day += 9) : (month -= 2, day -= 22);
				break;
			case 10:
				(day < 23) ? (month = 7, day += 8) : (month = 8, day -= 22);
				break;
			case 11:
			case 12:
				(day < 22) ? (month -= 3, day += 9) : (month -= 2, day -= 21);
				break;
			default:
				break;
		}
	}
	return week[d] + " " + day + " " + months[month - 1] + " " + year ;
}





