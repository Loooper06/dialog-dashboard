$(document).ready(function() {

	/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= 
		On load
	=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */

	// tooltip 
	$('#nav > li, abbr').tooltip({
		placement:'right',
	});
	$('.list-header > i').tooltip({
		placement:'bottom',
	});
	$('.mail-head button').tooltip({
		trigger: 'hover',
	});

	// Set height of mailbox
	function mail_height() {
        var BH = $(window).height();
        //$('.mailbox').css({'height':BH-150});
    };
    $(window).on("resize",mail_height);
    $(window).on("load",mail_height);




	/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= 
		Show/Hide mail or contact
	=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
	var content = $('#content_load .email, #content_load .contact');

	$('#nav li').click(function(){
		content.fadeOut();
	});

	// Load email for read and reply
	$('#tab-list .media-body, #archive_tree span').click(function(){
		content.hide();
		$('#content_load .email').fadeIn();
	});

	// Load email for compose
	$('#contact_tree button.fa-envelope, #show_compose_2').click(function(){
		content.hide();
		$('#content_load .email').fadeIn();
	});

	// Load contact for add OR edit
	$('#contact_tree button.fa-edit').click(function(){
		content.hide();
		$('#content_load .contact').fadeIn();
	});





	/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= 
		Click on list button actions
	=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
	$('#add_contact').click(function(){
		content.hide();
		$('#content_load .contact').fadeIn();
	});






	/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= 
		Show tabs and lists
	=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
	$('#nav li').click(function() {
	    $('#nav li a').removeClass("active");
	    $(this).find('a').addClass("active");
	    $('#tab-list > div').hide();

	    var id = $(this).attr('show');
	    $('#tab-list #'+id).fadeIn();
	});

	$('#tab-list > div').hide();
	$('#nav li:nth-child(1)').trigger('click'); // which tab become initially enabled?






	/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= 
		Image checkbox
	=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
	$('#tab-list .media-left').click(function(){
		$(this).toggleClass('checked');
		mail_check();
	});

	mail_check();
	function mail_check() {
		$('#tab-list .media-left').each(function() {
			if ($(this).hasClass('checked')) {
				$(this).find('img.media-object').removeClass('i#000000').addClass('i#010200');
			}
			else {
				$(this).find('img.media-object').removeClass('i#010200').addClass('i#000000');
			}
		});
		cc_fColorClass(15);
    };



	/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= 
		Multiple form group
	=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */

	var addFormGroup = function (event) {
	    event.preventDefault();

	    var $formGroup = $(this).closest('.form-group');
	    var $multipleFormGroup = $formGroup.closest('.multiple-form-group');
	    var $formGroupClone = $formGroup.clone();

	    $(this).toggleClass('btn-success btn-add btn-danger btn-remove').html('–');

	    $formGroupClone.find('input').val('');
	    $formGroupClone.find('.concept').text('تلفن');
	    $formGroupClone.insertAfter($formGroup);

	    var $lastFormGroupLast = $multipleFormGroup.find('.form-group:last');
	    if ($multipleFormGroup.data('max') <= countFormGroup($multipleFormGroup)) {
	        $lastFormGroupLast.find('.btn-add').attr('disabled', true);
	    }
	    $('.btn-add').removeClass('waves-effect');
	};

	var removeFormGroup = function (event) {
	    event.preventDefault();

	    var $formGroup = $(this).closest('.form-group');
	    var $multipleFormGroup = $formGroup.closest('.multiple-form-group');

	    var $lastFormGroupLast = $multipleFormGroup.find('.form-group:last');
	    if ($multipleFormGroup.data('max') >= countFormGroup($multipleFormGroup)) {
	        $lastFormGroupLast.find('.btn-add').attr('disabled', false);
	    }

	    $formGroup.remove();
	};

	var selectFormGroup = function (event) {
	    event.preventDefault();

	    var $selectGroup = $(this).closest('.input-group-select');
	    var param = $(this).attr("href").replace("#","");
	    var concept = $(this).text();

	    $selectGroup.find('.concept').text(concept);
	    $selectGroup.find('.input-group-select-val').val(param);

	}

	var countFormGroup = function ($form) {
		return $form.find('.form-group').length;
	};

	$(document).on('click', '.btn-add', addFormGroup);
	$(document).on('click', '.btn-remove', removeFormGroup);
	$(document).on('click', '.dropdown-menu a', selectFormGroup);





	/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= 
		Image preview filename input
	=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */

	$(document).on('click', '#close-preview', function(){ 
	    $('.image-preview').popover('hide');
	    $('.image-preview').hover(
	        function() { $('.image-preview').popover('show') }, 
	        function() { $('.image-preview').popover('hide') }
	    );    
	});

	// Clear event
	$('.image-preview-clear').click(function(){
		$('.image-preview').attr("data-bs-content","").popover('hide');
		$('.image-preview-filename').val("");
		$('.image-preview-clear').hide();
		$('.image-preview-input input:file').val("");
		$(".image-preview-input-title").text("انتخاب مجدد"); 
	}); 

	// Create the preview image
	$(".image-preview-input input:file").change(function (){
		var file = this.files[0];
		var reader = new FileReader();
		reader.onload = function (e) {
			$(".image-preview-input-title").text("تغییر");
			$(".image-preview-clear").show();
			$(".image-preview-filename").val(file.name);            
			$(".image-preview").popover("dispose").popover({
				trigger:'manual',
				html:true,
				title: "<strong>پیش نمایش</strong><span class='la la-times float-end' id='close-preview'></span>",
				content: "<img src='"+e.target.result+"' width='250' height='auto' />",
				placement:'bottom'
			}).popover("show");
		}
		reader.readAsDataURL(file);

	});



});
