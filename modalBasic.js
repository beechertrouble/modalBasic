/**
*
*
* modalBasic
* by BeecherTrouble : beechbot.com
*
*
*/
;(function($, scope) {
	
	var _mb = {
			args : {
				callbacks : {
					beforeInit : undefined,
					onInit : undefined,
					beforeMarkup : undefined,
					onMarkup : undefined,
					beforeBind : undefined,
					onBind : undefined,
					beforeShow : undefined,
					onShow : undefined,
					beforeHide : undefined,
					onHide : undefined,
					yarp : undefined,
					narp : undefined
				}
			},
			state : {
				lang : $("html").attr("lang") !== undefined ? $("html").attr("lang") : 'en',
				inited : false,
				markedup : false,
				bound : false,
				visible : false
			},
			appendTo : undefined
		},
		$wrap, $header, $body, $footer, $close,
		lastFocus, lastFocusInner, formValString,
		hideClass = '_mb_hide_me',
		showClass = '_mb_show_me',
		doCallback, addMarkup, reset, buildConfirm, focusOn, bind;
			
	
	//
	// the markup template ... let's expose this incase people want to override it
	//				
	_mb.markup = '<div id="_mb_uber">' + 
				'<div id="_mb_fixed_wrap">' +
					'<div id="_mb_rel_wrap">' + 
						'<div id="_mb_content_wrap" role="dialog" aria-labelledby="_mb_header" aria-describedby="_mb_body">' + 
							'<div id="_mb_header" class="' + hideClass + '" tabindex="0"></div>' + 
							'<div id="_mb_body" tabindex="0"></div>' + 
							'<div id="_mb_footer" class="' + hideClass + '" tabindex="0"></div>' + 
							'<button class="_mb_close _mb_internal_close" type="button" title="click to close" aria-label="close modal">close</button>' +
							'<div class="_mb_closeconfirm_wrap"><div class="_mb_closeconfirm_inner" tabindex="0">' + 
								'<p>Are you sure you want to close? <br/>You will lose any work you\'ve done in this modal.</p>' + 
								'<button class="_mb_closeconfirm_narp" data-which="narp">Cancel Close</button>' + 
								'<button class="_mb_closeconfirm_yarp" data-which="yarp">Confirm Close</button>' + 
							'</div></div>' + 
						'</div>' + 
					'</div>' + 
				'</div>' +
				'<button class="_mb_close _mb_external_close" type="button" title="click to close" aria-label="close modal">close</button>' +
			'</div>';
				
	_mb.confirmMarkup = '<div id="_mb_confirm_wrap">' + 
							'<button id="_mb_confirm_narp" data-which="narp" type="button" aria-label="cancel">[narpText]</button>' + 
							'<button id="_mb_confirm_yarp" data-which="yarp" type="button" aria-label="confirm">[yarpText]</button>' + 
						'</div>';
	
	//
	// some setup methods ...
	//
	_mb.init = function(args){
		
		//
		// defaults
		//
		args = args === undefined ? {} : args;
		_mb.args.addCSS = args.addCSS !== undefined ? args.addCSS : true;
		_mb.args.addMarkup = args.addMarkup !== undefined ? args.addMarkup : true;
		_mb.args.appendTo = args.appendTo !== undefined ?  args.appendTo : document.body;
		if(args.callbacks !== undefined) {
			for(var c in _mb.args.callbacks) {
				_mb.args.callbacks[c] = args.callbacks[c] !== undefined ? args.callbacks[c] : undefined;
			}
		}
		_mb.state.lang = args.lang !== undefined ? args.lang : _mb.state.lang;
		
		doCallback('beforeInit');

		addMarkup();
		bind();
		
		_mb.state.inited = true;
		doCallback('onInit');
		
	}; // init()
	
	//
	// some behavioral methods ... 
	//
	_mb.show = function(args) {
		
		if(!_mb.state.inited) _mb.init(args);
		
		var addClass = '',
			showFor = false,
			confirm = false;
		
		if(args !== undefined) {
			
			reset();

			if(args.header !== undefined)
				$header.html(args.header).removeClass(hideClass);
			
			if(args.body !== undefined)
				$body.html(args.body);

			if(args.footer !== undefined)
				$footer.html(args.footer).removeClass(hideClass);
			
			if(args.callbacks !== undefined) {
				for(var c in args.callbacks) {
					_mb.args.callbacks[c] = args.callbacks[c];
				}
			}

			if(args.confirm !== undefined)
				buildConfirm(args.confirm);	

			addClass = args.addClass !== undefined ? args.addClass : '';
			showFor = args.showFor !== undefined ? args.showFor : false;

		}

		doCallback('beforeShow');
		
		$wrap
			.removeClass()
			.addClass(showClass + ' ' + addClass);
		
		focusOn();
		
		// keep people from losing data ...
		if($body.find('form').length > 0) {
			formValString = $body.find('form').serialize();
			$wrap.addClass('_mb_confirm_before_close');
		}
		
		_mb.state.visible = true;
		
		$("body").css({'overflow' : 'hidden'});
		
		doCallback('onShow');

		// showFor
		if(!!showFor && !confirm)
		 	setTimeout(function(){_mb.hide(); }, showFor);

	}; // show()
	_mb.hide = function(force) {
		
		force = force === undefined ? false : force;
		
		if(!_mb.state.inited) return;
		
		// confirm before closing if form value has changed ...		
		if(!force && $wrap.hasClass('_mb_confirm_before_close') && formValString != $body.find('form').serialize()) {
						
			$wrap.addClass('_mb_closeconfirm');
			focusOn('closeconfirm');
			return;
		
		} else {
		
			doCallback('beforeHide');
			doCallback('narp');
			
			$wrap.removeClass(showClass);
			
			_mb.state.visible = false;
			
			if(lastFocus !== undefined)
				lastFocus.focus();
							
			$("body").css({'overflow' : 'auto'});
			
			doCallback('onHide');
			
		}

	}; // hide()
	_mb.translate = function(ting, lang) {

		if(ting === undefined || ting === '') return false;
		
		lang = lang !== undefined ? lang : _mb.state.lang;
		
		var original = ting,
			translation = false;

		if(typeof ting != 'object') {
			ting = JSON.stringify(ting);
			ting = JSON.parse(ting);
		}

		// try current lang ...
		translation = ting[lang] === undefined ?  false : ting[lang];

		// default to en because ...
		if(!translation && _mb.state.lang != 'en')
			translation = ting.en === undefined ?  false : ting.en;

		// still no? how about the original string ...
		if(!translation && typeof original == 'string')
			translation = original;

		return translation;

	}; // translate()
		
	//
	// private methods ...
	//
	doCallback = function(callback) { 
		callback = _mb.args.callbacks[callback];
		if(typeof callback !== 'function') return;
		if(!_mb.state.bound) {
			callback(_mb); 
		} else {
			callback(_mb, $wrap, $header, $body, $footer, $close); 
		}
	};
	addMarkup = function(){
		
		if(!_mb.args.addMarkup || _mb.state.markedup) return false;
		
		doCallback('beforeMarkup');
		
		$(_mb.args.appendTo).append(_mb.markup);
		
		_mb.state.markedup = true;
		
		doCallback('onMarkup');
		
	}; // addMarkup()
	reset = function() {
	
		$body.empty();
		$header.addClass(hideClass).empty();
		$footer.addClass(hideClass).empty();
		_mb.args.callbacks.narp = undefined;
		_mb.args.callbacks.yarp = undefined;
		
	}; // reset()
	buildConfirm = function(confirm) {
				
		var defaults = { // leaving space for translation
				yarp : {
					'en' : 'confirm'
				},
				narp : {
					'en' : 'cancel'
				}
			},
			yarpText = _mb.translate(confirm.yarp.text) !== undefined ? confirm.yarp.text : defaults.yarp, // ✓
			narpText = _mb.translate(confirm.narp.text) !== undefined ? confirm.narp.text : defaults.narp; // ✗

		yarpText = _mb.translate(yarpText);
		narpText = _mb.translate(narpText);

		$footer
			.append(_mb.confirmMarkup.replace('[yarpText]', '<span>✓</span> ' + yarpText).replace('[narpText]', '<span>✗</span> ' + narpText));

		if(confirm.yarp !== undefined && confirm.yarp.disabled)
			$("#_mb_confirm_yarp").attr('disabled', true);

		if(confirm.narp !== undefined && confirm.narp.disabled)
			$("#_mb_confirm_narp").attr('disabled', true);

		$footer.removeClass(hideClass);

	}; // buildConfirm()
	focusOn = function(which) {
		
		var activeEl = document.activeElement !== undefined && document.activeElement !== null ? document.activeElement : undefined;
		
		switch(which) {

			case('closeconfirm'):
				if(activeEl !== undefined) {
					lastFocusInner = activeEl;
					lastFocusInner.blur();
				}
				$wrap.find('._mb_closeconfirm_inner').focus();
				break;
			
			default:
				if(activeEl !== undefined && $(activeEl).parents('#_mb_uber').length <= 0) {
					lastFocus = activeEl;
					lastFocus.blur();
				}
				if($header.text().length > 0) {
					$header.focus();
				} else if($body.text().length > 0) {
					$body.focus();
				} else if($footer.text().length > 0) {
					$footer.focus();
				} 
				break;
		}
		
	}; // lastFocus()
	bind = function() {
		
		// refs ...
		$wrap = $('#_mb_uber');
		$header = $("#_mb_header");
		$body = $("#_mb_body");
		$footer = $("#_mb_footer");
		$close = $("._mb_close");
		
		doCallback('beforeBind');
		
		$(document.body)
			.on('click', '#_mb_uber', function(e) {
				e.preventDefault();
				e.stopPropagation();
				_mb.hide();
			})
			.on('click touchstart touchmove touchend', '#_mb_content_wrap', function(e) {
				e.stopPropagation();
			})
			.on('click', '._mb_close', function(e) {
				e.preventDefault();
				_mb.hide();
			})
			.on('click', '#_mb_confirm_wrap button', function(e) {
				e.preventDefault();
				
				var which = $(this).data('which');
				doCallback(which);
				
				if(which == 'yarp');
					_mb.args.callbacks.narp = undefined;
					
				_mb.hide();

			})
			.on('click', '._mb_closeconfirm_narp', function(e){
				e.preventDefault();
				$wrap.removeClass('_mb_closeconfirm');
				focusOn();
			})
			.on('click', '._mb_closeconfirm_yarp', function(e){
				e.preventDefault();
				_mb.hide(true);
			});
		
		$(window)
			.on('keyup', function(e){

				if(e.which == 27 && _mb.state.visible) _mb.hide();

			});
		
		_mb.state.bound = true;
			
		doCallback('onBind');
		
	}; // bind()
	
	scope._mb = _mb;

})($ || jQuery, this); // modalBasic	

/**
* Expose as an AMD
*/
if (typeof define === "function") 
	define("_mb", [], function () { return _mb; } );