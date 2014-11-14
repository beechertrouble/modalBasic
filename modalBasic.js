/**
*
*
* modalBasic
* by BeecherTrouble : beechbot.com
*
*
*/
(function($, W) {
	
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
			}
		},
		$wrap, $header, $body, $footer, $close,
		lastFocus,
		hideClass = '_mb_hide_me',
		showClass = '_mb_show_me',
		doCallback, addMarkup, reset, buildConfirm, bind;
			
	
	//
	// the markup template ... let's expose this incase people want to override it
	//
	_mb.markup = '<div id="_mb_uber">'
					+ '<div id="_mb_rel_wrap">'
						+ '<div id="_mb_content_wrap">'
							+ '<div id="_mb_header" class="' + hideClass + '"></div>'
							+ '<div id="_mb_body"></div>'
							+ '<div id="_mb_footer" class="' + hideClass + '"></div>'
							+ '<button id="_mb_close" type="button" title="click to close" aria-label="close modal">x</button>' 
						+ '</div>'
					+ '</div>'
				+ '</div>';
				
	_mb.confirmMarkup = '<div id="_mb_confirm_wrap">'
							+ '<button id="_mb_confirm_narp" data-which="narp" type="button" aria-label="cancel">[narpText]</button>'
							+ '<button id="_mb_confirm_yarp" data-which="yarp" type="button" aria-label="confirm">[yarpText]</button>'
						+ '</div>';
	
	//
	// some setup methods ...
	//
	_mb.init = function(args){
		
		//
		// defaults
		//
		var args = args === undefined ? {} : args;
		_mb.args.addCSS = args.addCSS !== undefined ? args.addCSS : true;
		_mb.args.addMarkup = args.addMarkup !== undefined ? args.addMarkup : true;
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
		
		lastFocus = document.activeElement;
		lastFocus.blur();
		
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

		$body.focus();
		
		if($footer.find('button').length > -1)
			$footer.find('button:enabled:first').focus();

		if($body.find('form').length > -1) // autofocus on first element in form ...
			$body.find('form:not([type="hidden"]) :input:visible:enabled:first').focus();
		
		_mb.state.visible = true;
		
		doCallback('onShow');

		// showFor
		if(!!showFor && !confirm)
		 	setTimeout(function(){_mb.hide(); }, showFor);

	}; // show()
	_mb.hide = function() {
		
		if(!_mb.state.inited) return;
		
		doCallback('beforeHide');
		doCallback('narp');
		
		$wrap.removeClass(showClass);
		
		_mb.state.visible = false;
		
		lastFocus.focus();
		
		doCallback('onHide');

	}; // hide()
	_mb.translate = function(ting, lang) {

		if(ting === undefined || ting == '') return false;
		
		lang = lang !== undefined ? lang : _mb.state.lang;
		
		var original = ting
			, translation = false;

		if(typeof ting != 'object') {
			ting = JSON.stringify(ting);
			ting = JSON.parse(ting);
		}

		// try current lang ...
		translation = ting[lang] === undefined ?  false : ting[lang];

		// default to en because ...
		if(!translation && _mb.state.lang != 'en')
			translation = ting['en'] === undefined ?  false : ting['en'];

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
		
		$(document.body).append(_mb.markup);
		
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
	bind = function() {
		
		// refs ...
		$wrap = $('#_mb_uber');
		$header = $("#_mb_header");
		$body = $("#_mb_body");
		$footer = $("#_mb_footer");
		$close = $("#_mb_close");
		
		doCallback('beforeBind');
		
		$(document.body)
			.on('click', '#_mb_uber', function(e) {
				e.preventDefault();
				e.stopPropagation();
				_mb.hide();
			})
			.on('click', '#_mb_content_wrap', function(e) {
				e.stopPropagation();
			})
			.on('click', '#_mb_close', function(e) {
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

			});
		
		$(W)
			.on('keyup', function(e){

				if(e.which == 27 && _mb.state.visible) _mb.hide();

			});
		
		_mb.state.bound = true;
			
		doCallback('onBind');
		
	}; // bind()
	
	W._mb = _mb;

})($ || jQuery, window); // modalBasic	

/**
* Expose as an AMD
*/
if (typeof define === "function") 
	define("_mb", [], function () { return _mb; } );