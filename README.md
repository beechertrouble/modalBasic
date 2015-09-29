modalBasic
========
Trying to keep this one real bare bones and semantic - other things can extend it perhaps ...

### Requirements
- javascript must be enabled
- jQuery

### Browser Support
- ie8 and lower may be funny with positioning as we're using a pseudo element to vertically center the modal content. 
- Animations and transitions are accomplished with css, so your browser will need to support that, otherwise things will just show up without the fanciness. 

### Namespacing
- using a prefix of "_mb" in css
- set as "window._mb" in js

### Markup
The following markup is appeneded to the document.body onInit :
```html
<div id="_mb_uber">
	<div id="_mb_fixed_wrap">
		<div id="_mb_rel_wrap">
			<div id="_mb_content_wrap">
				<div id="_mb_header" class="hideClass" tabindex="0"></div>
				<div id="_mb_body" tabindex="0"></div>
				<div id="_mb_footer" class="hideClass" tabindex="0"></div>
				<button class="_mb_close _mb_internal_close" type="button" title="click to close" aria-label="close modal">close</button>
				<div class="_mb_closeconfirm_wrap"><div class="_mb_closeconfirm_inner" tabindex="0">
					<p>Are you sure you want to close? <br/>You will lose any work you\ve done in this modal.</p>
					<button class="_mb_closeconfirm_narp" data-which="narp">Cancel Close</button>
					<button class="_mb_closeconfirm_yarp" data-which="yarp">Confirm Close</button>
				</div></div>
			</div>
		</div>
	</div>
	<button class="_mb_close _mb_external_close" type="button" title="click to close" aria-label="close modal">close</button>
</div>
```

### Styling
We are using css for proper positioning (not javascript), transitions, and of course styling. You can include the [default styles](https://raw.githubusercontent.com/beechertrouble/modalBasic/master/modalBasic.min.css), extend them, or roll your own.

### Javascript

#### Callbacks / Events / Init
- There's a pile of callbacks that can be defined when you init the _mb. Most are passed :  a reference to the modal object, and some local vars for the main bits of markup.

```javascript

var args = {
	callbacks: {
		beforeInit : function() {
			console.log('beforeInit');
		},
		onInit :  function(_mb, $wrap, $header, $body, $footer, $close) {
			console.log('onInit');
			console.log(_mb);
			console.log($wrap);
		},
		beforeMarkup : function() {
			console.log('beforeMarkup');
		},
		onMarkup :  function() {
			console.log('onMarkup');
		},
		beforeBind : function() {
			console.log('beforeBind');
		},
		onBind :  function() {
			console.log('onBind');
		},
		beforeShow : function() {
			console.log('beforeShow');
		},
		onShow :  function() {
			console.log('onShow');
		},
		beforeHide :  function() {
			console.log('beforeHide');
		},
		onHide :  function() {
			console.log('onHide');
		},
		yarp : function() {
			// this needs to be defined in the show(args)
			console.log('yarp fires when the confirm button has been hit');
		},
		narp : function() {
			// this needs to be defined in the show(args)
			console.log('narp fires when the cancel button has been hit');
		}
	}
};

_mb.init(args);
```

#### Methods
The following methods are available to you after init.

(note: or you can just call `show(args)` and the args will be passed to `init(args)`): 

- `_mb.show(args);`
	- advanced args : 
		
		```javascript
			var args = {
					header: 'header content with <span>markup</span>',
					body: 'body content with <span>markup</span>, if you're into that kinda thing ...',
					footer: 'footer content without markup, but this can take markup too.',
					addClass : 'the_class_you_want_to_add_to_the_wrap or_classes',
					showFor : 5000 // number of milliseconds to show the modal for, before hiding it automatically
				};
		```
	- most basic example : 
	
		```javascript
			_mb.show({body : 'hello'});
		```
- `_mb.hide();` - you guessed it.
	- this is also called by, hitting the ESC key, clicking close button, or anything outside the content wrap.


### Confirm / Prompt
- Based on the window.confirm method, but with greater styling and functional possibilities.
- We're using a "yarp/narp" convention instead of "confirm/cancel".
- Specify button text like (defaults to 'confirm' and 'cancel'):
	 
	 ```javascript
	 var confrimArgs = {
	 	yarp : {
	 		text: "the confirm button text",
	 		disabled: true // optional
	 	},
	 	narp : { 
	 		text: { // if you want translations
	 			"en" : "cancel in english",
	 			"es" : "como se dice, 'cancel'?"
	 		}
	 	}
	 };
	 
	 // then you'd pass it to the show method like
	 _mb.show({
	 		body: "whatever?",
	 		confirm: confrimArgs
	 	});
	 ```
- Specify functionality within the callbacks 'yarp' and 'narp' :
	
	```javascript
	var confirmAction = function(_mb) {
			// whatver you want, really ...
		},
		cancelAction = function(_mb) {
			// whatver you want, really ...
		};
		
	 _mb.show({
	 		body: "whatever?",
	 		callbacks: {
	 			yarp : confirmAction,
	 			narp : cancelAction
	 		}
	 	});
	```


### Translations
- tries to grab the "lang" property from the html tag (defaults to "en"). (see ref for iso codes [here](http://www.w3schools.com/tags/ref_language_codes.asp))
- you can manually override this: `_mb.state.lang = "jp";`
- to use this feature you can:
	- ignore it and just provide single strings.
	- provide translation objects like :
	
		```javascript
			var hello = {
					"en" : "hello",
					"es" : "hola",
					"fr" : "bonjour"
					// ... etc
				};
		```
- you can call this method directly like :

	```javascript
		var hello = {
				"en" : "hello",
				"es" : "hola",
				"fr" : "bonjour"
				// ... etc
			};
		// auto lang choice ...
		var helloTranslated = _mb.translate(hello);
		// or override for aspecific lang ...
		var helloFrance = _mb.translate(hello, 'fr');
	```
	
## To Do
- add translation to more places and make default text/arias more configurable
- revisit hiding scrollbars in firefox ... 
- lower the specificity of the css ...

