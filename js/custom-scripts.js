/*****************************************************************************************
 * Template Name: Dialog - Admin Dashboard Based On Bootstrap
 * Author: WiCard team
 * Note: To be able to benefit of next version of materials and widgets and other updates,
		 is better to create separate js file and load it after all other js files.
*****************************************************************************************/


$(document).ready(function() {


	/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= 
		ON-LOAD CODES
	=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */

		/* Custom Scroll bar */
		$('#side_panel').mCustomScrollbar({
			theme:"minimal-dark",
		});
		$('#sidebar').mCustomScrollbar({
			theme:"minimal",
		});



		/* bootstrap tooltip and popover */
		var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
		var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
			return new bootstrap.Tooltip(tooltipTriggerEl)
		})

		var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
		var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
			return new bootstrap.Popover(popoverTriggerEl)
		})



		/* waves click effect (Ripple) */
		document.querySelectorAll('.btn, #cssmenu ul li a').forEach((cardRipple) => {
			new mdb.Ripple(cardRipple, {
				//color: 'light' put your options
			})
		});



		/* content columns resize */
		$('#column2').resizable({ handles: 'e' });
		$('#column0').resizable({ handles: 's' });



		/* Panels drag and drop */
		$("#column1, #column2, #column0").sortable({
			placeholder: "ui-state-highlight",
			handle: ".sort-hand",
			connectWith: ".connectcolumn",
			cursor: "grabbing",
		}); 



		/* Scrol to top */
		$('#ToTop').click(function(){
			$('body, html').animate({scrollTop: 0});
		});



		/* Blink alerts */
		setInterval(function(){ 
			$('.blink').removeClass('blink', function(){
				$(this).addClass('blink');
			});
		}, 20000);





	/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= 
		SIDEBAR
	=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */



		/* sidebar toggle on click */
		$('#sidebar_toggle').click(function () {
			var SD = $("#sidebar").css('display');
			if(SD == 'block'){
				$('#sidebar').removeClass('is-open').addClass('is-close');
			}
			else {
				$('#sidebar').removeClass('is-close').addClass('is-open');
			};
			$(this).toggleClass('la-outdent').toggleClass('la-indent');
			SetPaddings(); // custom-functions.js
		});


		/* sidebar accordion */
		$('#cssmenu li.has-sub>a').click(function(){
			var element = $(this).parent('li');
			var BrWidth = $(window).width();
			if ($('.StickySidebar').attr('id') == 'menu_ver' || BrWidth <= 992) {
				if (element.hasClass('open')) {
					element.removeClass('open');
					element.find('li').removeClass('open');
					element.find('ul').slideUp();
				}
				else {
					element.addClass('open');
					element.children('ul').slideDown();
					element.siblings('li').children('ul').slideUp();
					element.siblings('li').removeClass('open');
					element.siblings('li').find('li').removeClass('open');
					element.siblings('li').find('ul').slideUp();
				}
			};
		});


		/* sidebar menu active item */
		var FileName = window.location.pathname.split('/').pop();
		if (FileName == '') {
			$('#cssmenu > ul:first-child > li:first-child').addClass('active');
		}
		else {
			$('#cssmenu a[href="'+FileName+'"').parents('li').addClass('active open');
		};





	/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= 
		PANEL CONTROL BUTTONS
	=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */

		/* Put buttons */
		$('.pan-btn.min').append('<span class="minimize_btn la la-chevron-up"></span>');
		$('.pan-btn.expand').append('<span class="fullsize_btn la la-expand"></span>');
		$('.pan-btn.reload').append('<span class="reload_btn la la-refresh"></span>');


		/* Minimize btn */
		$(".minimize_btn").click(function(event){
			$(this).parents(".card").find(".card-body, .list-group, .table").slideToggle(200);
			$(this).toggleClass('la-chevron-down').toggleClass('la-chevron-up');
		}); 


		/* Expand btn */
		$('.fullsize_btn').click(function(){ 
			$(this).parents('.card').toggleClass('fullscreen-card');
			$(this).parents('.card').find('.sort-hand, .drag-hand').toggleClass('sort-hand').toggleClass('drag-hand');

			$('.fullscreen-card').mousedown(function(){
				$('.fullscreen-card').css({"z-index" : "98"});
				$(this).css({"z-index" : "99"});
			});

			if ($(this).parents('.card').hasClass("fullscreen-card")) {
				$(this).parents('.fullscreen-card').draggable({
					handle: ".drag-hand",
					cursor: "grabbing"
				}).resizable({ 
					handles: 'w' 
				});
				$(this).parents('.card').find('.ui-resizable-handle').show();
			}
			else {
				$(this).parents('.card').removeAttr('style').removeClass('ui-resizable').removeClass('ui-draggable');
				$(this).parents('.card').find('.ui-resizable-handle').hide();
				$('.card').css({'border-radius': $('#corners_s').slider('option', 'value')});
			};

			$(this).toggleClass('la-compress').toggleClass('la-expand');

		});


		/* Reload btn */
		$('.reload_btn').click(function(){
			var loadable = $(this).parents('.card').find('.card-body');
			$(loadable).animate({opacity: "0.3"});
			setTimeout(function(){ $(loadable).animate({opacity: "1"}); }, 800);
		});




	/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= 
		TOP NAVBAR
	=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */

		// Open and close top help panel
		$('#top_panel_slide').click(function(){
			$("#top_panel").slideToggle(900, 'easeOutBounce');
			$(this).find('i').toggleClass('la-question-circle-o').toggleClass('la-toggle-up');
		});


		// Full screen 
		$('#full_screen').click(function(){
			FullScreen();
		});


		// Mega menu toggle
		$('#mega_menu_btn > a').click(function(){
			$("#mega_menu").slideToggle(300, 'easeOutCubic');
		});


		// Close all sidebars and menus by overlay click 
		$('#content, #sidebar, #first-navbar .navbar-nav > li').click(function(){
			if ($(this).attr('id') != 'mega_menu_btn') {
				$("#mega_menu").slideUp(400, 'easeOutCubic');
			};
			$("#top_panel").slideUp(700, 'easeOutBounce');
			$('#top_panel_slide i').removeClass('la-toggle-up').addClass('la-question-circle-o');
			$('#side_panel').hide();
		});






	/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= 
		SIDE PANEL
	=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */

		/* toggle of side fast panel */
		$('.side_panel_toggle_1, .side_panel_toggle_2').click(function () {
			$('#side_panel').toggle("slide", {direction:"left"});
		});


		/* auto coloring of side panel progress Bars */
		$('#taskbtn').click(function () {
			setTimeout(function(){ ProgressBars(); }, 200); // custom-functions.js
		});


		/* slide of chat list and chat messages */
		$('#chat_users .media-body').click(function () {
			$('#chat_users').toggle("slide", { direction: "left" }, 200);
			setTimeout(function(){ $('#user_message').toggle("slide", { direction: "right" }, 200); }, 200);
			setTimeout(function(){ $('.back-to i').toggle(200); }, 300);
			$("#chats_btn, #messages_btn").toggle();
			$('#chat_header').html($(this).find('p:first-child').text());
		});
		$('.back-to i').click(function () {
			setTimeout(function(){ $('#chat_users').toggle("slide", { direction: "left" }, 200); }, 200);
			$('#user_message').toggle("slide", { direction: "right" }, 200);
			$('.back-to i').toggle();
			$("#chats_btn, #messages_btn").toggle();
			$('#chat_header').html('انتخاب کنید');
		});


		/* chat auto scrol to bottom */
		$('#send_btn').click(function () { ChatScroller(); }); // custom-functions.js
		$('#chat_users .media-body').click(function () { 
			setTimeout(function(){ ChatScroller(); }, 400); // custom-functions.js
		});
			

		/* on and off log out button in chat */
		$("#log_outer").click(function () {
			$(this).find('i').toggleClass('t#f07').toggleClass('t#444');
			cc_fColorClass(2);
		});





	/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= 
		THEME OPTIONS
	=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */

		/* font size control */ 
		$('#smaller.fontsize').click(function() {
			$('section, p, h1, h2, h3, h4, h5, h6').each(function() {
				var nums = parseFloat($(this).css('font-size'));
				$(this).css('font-size', nums * 0.980392157 );
			});
		});
		$('#larger.fontsize').click(function() {
			$('section, p, h1, h2, h3, h4, h5, h6').each(function() {
				var nums = parseFloat($(this).css('font-size'));
				$(this).css('font-size', nums * 1.02 );
			});
		});



		/* theme colors */
		$('.full-color-changer button').click(function(){
			var dc = $(this).attr('data-color');
			$('body').attr("id", dc );
		});

		$('.menu-color-changer button').click(function(){
			var c = $(this).css('color');
			var b = $(this).css('background-image');
			if (b=='none') {
				var b = $(this).css('background-color');
			}
			$('#top-navbar, #sidebar, .StickySidebar').css("background", b );
			$('#top-navbar, #sidebar').css("color", c );
		});



		/* background patterns */
		$('#patt_btn').click(function(){
			$("#wait").show();
			$('#pattern_thumb').load('assets/patterns.html');
		});

		$(document).ajaxComplete(function(){
			$("#wait").hide();
			$('#pat_images .patt-item').click(function(){
				$('#PattInput').val($(this).text());
				$('#pat_images .patt-item').removeClass('t#f00').addClass('t#000');
				$(this).removeClass('t#000').addClass('t#f00');
				cc_fColorClass(2);
			});
		});

		$('#BodyBtn').click(function(){
			var patt = $('#PattInput').val();
			$('body').css({'background':'url(img/patt/ern'+patt+'.png) fixed'});
			if(!$('#box_option').prop('checked')) {
				toastr.warning('این ویژگی فقط در حالت جعبه ای کار میکند. لطفا برای دیدن حالت جعبه ای دکمه ی "B" را فشار دهید.');
			}
		});

		$('#ContentBtn').click(function() {
			var patt = $('#PattInput').val();
			$('#content').css({'background':'#ecf0fa url(img/patt/ern'+patt+'.png)'});
		});

		$('#RemoveBtn').click(function() {
			$('body').css({'background':'none'});
			$('#content').css({'background':'#ecf0fa'});
		});



		/* Option switches */
		$('#options input[type=checkbox]').click(function(){
			Option_switches(); // custom-functions.js
			SetPaddings(); // custom-functions.js
		});



		/* sidebar horizontal and vertical */
		$('#user_btn, #admin_close').click(function(){
			$('#menu_hor .administrator').slideToggle(100);
		});

		$('#m_orient').change(function () {
			var o = $('#m_orient').val();
			if (o=='vertical') {
				$('.StickySidebar').removeAttr('id').attr('id','menu_ver');
				$('#sidebar').css({'bottom':'0'});
			}
			if (o=='horizontal') {
				$('.StickySidebar').removeAttr('id').attr('id','menu_hor');
				$('#menu_hor ul').removeAttr('style');
				$('#sidebar').css({'bottom':'auto'});
			}
			SetPaddings(); // custom-functions.js
		});




		/* sidebar corners  #corners_s */ 
		$( "#corners_s" ).slider({
			value: 10,
			min: 0,
			max: 30,
			slide: function( event, ui ) {
				$('#corners_txt').html( ui.value + 'px' );
				$('.card').css({'border-radius': ui.value});
				$('.card-header').css({'border-top-left-radius': ui.value, 'border-top-right-radius': ui.value});
				$('.card-footer').css({'border-bottom-left-radius': ui.value, 'border-bottom-right-radius': ui.value});
			}
		}).on('slidestart', function( event, ui ) {
			$('.card').css({'border': '1px solid red'});
		}).on('slidestop', function( event, ui ) {
			$('.card').css({'border': ''});
		});
		



		/* change sidebar width */
		$( "#side_w_s" ).slider({
			value: 230,
			min: 190,
			max: 310,
			slide: function( event, ui ) {
				$('#side_width_txt').html( ui.value + 'px' );
				$('#sidebar').css({'width': ui.value});
				SetPaddings();
			}
		});




		/* save options button */
		$('#save_options').click(function(){
			SaveOptions(); // custom-functions.js
			$('#ChangesSaved').show();
			setTimeout(function(){
				$('#ChangesSaved').hide();
			} , 2000);
		});






	/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= 
		PANEL MANAGER
	=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
		$('#find_panels').click(function(){
			$('.hide-card, .show-card').remove();
			$('td>.card, #content>.card').not('.card-body').each(function() {
				var id = $(this).attr('id');
				var tx = $(this).find('>.card-header').text();
				if($(this).css('display') == 'none'){
					$('#all_panels').append('<li class="show-card" save="'+id+'"><a class="dropdown-item"><i class="la la-check t#1c1"></i>'+tx+'</a></li>');
				}
				else {
					$('#all_panels').append('<li class="hide-card" save="'+id+'"><a class="dropdown-item"><i class="la la-remove t#f00"></i>'+tx+'</a></li>');
				}
			});
			$('.show-card').click(function(){
				var pID = $(this).attr('save');
				$('#'+pID).fadeTo(200, 0.8).fadeTo(400, 0.3).fadeTo(100, 1);
			});
			$('.hide-card').click(function(){
				var pID = $(this).attr('save');
				$('#'+pID).slideUp();
			});
			cc_fColorClass(2);
		});





	/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= 
		SCROLL TO PANELS 
	=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
		$('#scroll_to_panels').click(function(){
			$('.scrol-to').remove();
			$('td>.card, #content>.card').each(function() {
				var id = $(this).attr('id');
				var tx = $(this).find('>.card-header').text();
				if($(this).is(":visible")){
					$('#panels_to_scroll').append('<li class="scrol-to" save="'+id+'"><a class="dropdown-item">'+tx+'</a></li>');
				}
			});
			$('.scrol-to').click(function(){
				var pID = $(this).attr('save');
				if(pID == 'undefined' || pID == '' || pID == ' ') {
					toastr.warning('این پنل آی دی ندارد!');
				}
				else {
					var x = $('#'+pID).offset().top;
					var SId = $('.StickySidebar').attr('id');

					if($('#topfix').prop("checked") && SId == 'menu_hor') {
						$('body, html').animate({scrollTop: x-120}, 1000);
					}
					else if(!$('#topfix').prop("checked") && SId == 'menu_ver') {
						$('body, html').animate({scrollTop: x-10}, 1000);
					}
					else {
						$('body, html').animate({scrollTop: x-70}, 1000);
					};
				};
				setTimeout(function(){ $('#'+pID).fadeTo(200, 0).fadeTo(100, 1); },1100);
				cc_fColorClass(4);
			});
		});





	/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= 
		COLOR PICKER WITH SLIDER
	=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
		function hexFromRGB(r, g, b) {
			var hex = [
				r.toString( 16 ),
				g.toString( 16 ),
				b.toString( 16 )
			];
			$.each( hex, function( nr, val ) {
				if ( val.length === 1 ) {
					hex[ nr ] = "0" + val;
				}
			});
			return hex.join( "" ).toUpperCase();
		}
		function refreshSwatch() {
			var red = $("#reds").slider("value"),
			green = $("#greens").slider("value"),
			blue = $("#blues").slider("value"),
			hex = hexFromRGB( red, green, blue );
			$("#swatch").css("background-color","#"+hex).html('RGB('+red+','+green+','+blue+')'+'<br>#'+hex);
		}
		$(function() {
			$("#reds, #greens, #blues").slider({
				orientation: "horizontal",
				range: "min",
				max: 255,
				slide: refreshSwatch,
				change: refreshSwatch
			});
			$("#reds").slider("value", 190);
			$("#greens").slider("value", 70);
			$("#blues").slider("value", 125);
		});






	/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= 
		WIDGETS
	=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
		/* todo task list */
		$('.todo>ul>li').click(function(){
			$(this).toggleClass('todo-done');
		});


		/* Input Validation + Colorful Input Groups */
		$('.input-group input[required], .input-group textarea[required], .input-group select[required]').on('keyup change', function() {
			var $form = $(this).closest('form'),
				$group = $(this).closest('.input-group'),
				$addon = $group.find('.input-group-addon'),
				$icon = $addon.find('span'),
				state = false;
				
			if (!$group.data('validate')) {
				state = $(this).val() ? true : false;
			} else if ($group.data('validate') == "email") {
				state = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test($(this).val())
			} else if($group.data('validate') == 'phone') {
				state = /^[(]{0,1}[0-9]{4}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$/.test($(this).val())
			} else if ($group.data('validate') == "length") {
				state = $(this).val().length >= $group.data('length') ? true : false;
			} else if ($group.data('validate') == "number") {
				state = !isNaN(parseFloat($(this).val())) && isFinite($(this).val());
			}

			if (state) {
				$addon.removeClass('danger').addClass('success');
				$icon.attr('class', 'la la-check');
			} else {
				$addon.removeClass('success').addClass('danger');
				$icon.attr('class', 'la la-remove');
			}
			
			if ($form.find('.input-group-addon.danger').length == 0) {
				$form.find('[type="submit"]').prop('disabled', false);
			} else {
				$form.find('[type="submit"]').prop('disabled', true);
			}
		});
		$('.input-group input[required], .input-group textarea[required], .input-group select[required]').trigger('change');
		


		/* Orders - task list */
		$('.list-group.orders li').dblclick(function(){
			$(this).remove();
		});
		$('.orders').sortable({
			cursor: "grabbing",
		});
		$('.add-task-btn').click(function(){
			var t = $('.add-task-input').val();
			$('.list-group.orders').append('<li class="list-group-item border-dark">'+t+'</li>');
			$('.list-group.orders li').dblclick(function(){
				$(this).remove();
			});
			$('.add-task-input').val('');
		});



		/* Show Jalali day and date */
		var JalaliDayOnly;
		switch (new Date().getDay()) {
			case 0: JalaliDayOnly = "یکشنبه"; break;
			case 1: JalaliDayOnly = "دوشنبه"; break;
			case 2: JalaliDayOnly = "سه شنبه"; break;
			case 3: JalaliDayOnly = "چهار شنبه"; break;
			case 4: JalaliDayOnly = "پنجشنبه"; break;
			case 5: JalaliDayOnly = "جمعه"; break;
			case 6: JalaliDayOnly = "شنبه"; 
		}
		var JalaliDateOnly = new Date().toLocaleDateString("fa-IR");
		$("#JalaliDayAndDate").text(JalaliDayOnly + '، ' + JalaliDateOnly);




	/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= 
		KEYBOARD SHORTCUTS
	=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
		var M = Mousetrap;
		M.addKeycodes({
			// http://keycode.info
			83:'s',84:'t',82:'r',66:'b',77:'m',78:'n',86:'v',72:'h',76:'l',79:'o',67:'c',75:'k',
		});
		M.bind('t', function() { $('#top_panel_slide').trigger('click')});		// top panel
		M.bind('r', function() { $('.side_panel_toggle_1').trigger('click')});	// right sidebar
		M.bind('b', function() { $('#box_option').trigger('click') });			// boxed layout
		M.bind('m', function() { $('#sidebar_toggle').trigger('click')});		// menu
		M.bind('n', function() { $('#nightmode').trigger('click') });			// night mode
		M.bind('v', function() { $('#m_orient').val('vertical').change()});		// vertical menu
		M.bind('h', function() { $('#m_orient').val('horizontal').change()});	// horizontal menu
		M.bind('l o c k', function() { $('#lockscreen').toggle()});				// lock screen



});
/* End document ready */







/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= 
	Page Loading
=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
$(window).on("load", function() {

	// menu display
	if ($(window).width() <= 992) {
		$('#sidebar').removeClass('is-open').addClass('is-close');
		$('#sidebar_toggle').removeClass('la-outdent').addClass('la-indent');
	}
	else {
		$('#sidebar').removeClass('is-close').addClass('is-open');
		$('#sidebar_toggle').removeClass('la-indent').addClass('la-outdent');
	};

	// is in custom-functions.js
	SetOptions();
	ProgressBars(); 
	chat_height();
	SetPaddings();

	// fade page loading
	$(".page-loading").fadeOut(800);

});


/* sidebar and chat box on window resize */
$(window).resize( function() {

	// menu display
	if ($(window).width() <= 992) {
		$('#sidebar').removeClass('is-open').addClass('is-close');
		$('#sidebar_toggle').removeClass('la-outdent').addClass('la-indent');
	}
	else {
		$('#sidebar').removeClass('is-close').addClass('is-open');
		$('#sidebar_toggle').removeClass('la-indent').addClass('la-outdent');
	};

	// is in custom-functions.js
	SetPaddings();
	chat_height();

});
