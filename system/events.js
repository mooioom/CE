
$.extend( true, Designer, {

	events : {

		canvasEvents : false,

		threads : {
			onMouseDown     : [],
			onRender        : [],
			onCanvasMouseUp : []
		},

		events            : [],
		pressed           : [],
		keyboardEvents    : [],
		browserDropEvents : [],
		canvasDropEvents  : [],

		ctrl  : false,
		alt   : false,
		shift : false,

		mouseX : 0,
		mouseY : 0,

		prevMoveX : false,
		prevMoveY : false,

		startMoveX : 0,
		startMoveY : 0,
		movedX     : 0,
		movedY     : 0,

		mousePressed : false,
		drag         : false,

		brushMode   : false,
		brushRoute  : [],
		brushStartX : 0,
		brushStartY : 0,

		editMode        : false,

		cropMode  		: false,
		cropReview      : false,
		
		createPathMode  : false,
		createShapeMode : false,

		selectedActionPoint : null,
		activeActionPoint   : {},
		actionPointHover    : false,
		actionPointPress    : false,
		actionPointDrag     : false,

		transformMode   : false,

		eyeDropperGuide : false,

		simpleTools : ['image'],

		init : function()
		{

			this.keyboardEvents.push({ action : this.parent.functions.move, scope : this.parent.functions, shortcut : 'left',  args : 'left'  });
			this.keyboardEvents.push({ action : this.parent.functions.move, scope : this.parent.functions, shortcut : 'up',    args : 'up'    });
			this.keyboardEvents.push({ action : this.parent.functions.move, scope : this.parent.functions, shortcut : 'right', args : 'right' });
			this.keyboardEvents.push({ action : this.parent.functions.move, scope : this.parent.functions, shortcut : 'down',  args : 'down'  });
			this.keyboardEvents.push({ action : this.parent.functions.escapeKey, scope : this.parent.functions, shortcut : 'escape' });
			this.keyboardEvents.push({ action : this.parent.functions.enterKey,  scope : this.parent.functions, shortcut : 'enter'  });

			this.removeDuplicateKeyboardEvents();

			this.parent.canvas.addEventListener("mousemove",$.proxy(this.mouseMove,this),false);
			this.parent.canvas.addEventListener("mousedown",$.proxy(this.mouseDown,this),false);
			this.parent.canvas.addEventListener("mouseup",  $.proxy(this.mouseUp,this),false);

			$(document).unbind('keydown')
					   .unbind('keyup');

			$(document).bind('keydown', $.proxy(this.keyDown,this) )
					   .bind('keyup',   $.proxy(this.keyUp,this)   );

			$('body').bind('dragenter', $.proxy(this.ignoreDrag,this))
					 .bind('dragover',  $.proxy(this.ignoreDrag,this))
					 .bind('drop',      $.proxy(this.browserDrop,this));

			$("#canvas").droppable({drop:$.proxy(this.canvasDrop,this)});

			$(window).resize($.proxy(this.positionCanvas,this));

			$('.tools .button').unbind('click').bind('click', $.proxy(this.toolButton,this) );
			$('.toolbar .edit').unbind('click').bind('click', $.proxy(this.edit,this) );

			$(document).on('mousedown',$.proxy(this.onMouseDown,this));

		},

		on : function( events, selector, callback ){
			this.events.push({ events : events, selector : selector, callback : callback }); this.bind();
		},

		bind : function(){
			for(var i=0;i<this.events.length;i++){
				var e = this.events[i]; $(document).off(e.events, e.selector).on(e.events, e.selector, $.proxy(e.callback,this));
			}
		},

		onMouseDown     : function( e ){ for(var i=0;i<this.threads.onMouseDown.length;i++)     this.threads.onMouseDown[i](e); },
		onRender        : function(){    for(var i=0;i<this.threads.onRender.length;i++)        this.threads.onRender[i](); },
		onCanvasMouseUp : function(){    for(var i=0;i<this.threads.onCanvasMouseUp.length;i++) this.threads.onCanvasMouseUp[i](); },

		ignoreDrag : function( e ){
			e.originalEvent.stopPropagation();
			e.originalEvent.preventDefault();
		},

		mouseDown : function( e )
		{
			this.parent.helpers.getMousePosition( e );
			this.mousePressed = true;
			if(this.editMode && this.parent.helpers.isOverActionPoint() )
			{
				this.actionPointPress = true;
				this.parent.actions[ this.activeActionPoint.objectType ].actionPointDown.call(this.parent.actions,this.activeActionPoint);
			}else this.parent.actions[ this.parent.action ].mouseDown.call(this.parent.actions);
			this.parent.render();
			this.parent.draw.ui();
			this.parent.draw.toolbar();
			this.parent.onMouseDown();
		},

		mouseUp : function( e )
		{
			this.parent.helpers.getMousePosition( e );
			if(this.editMode && (this.parent.helpers.isOverActionPoint() || this.actionPointPress) )
			{
				this.parent.actions[ this.activeActionPoint.objectType ].actionPointUp.call(this.parent.actions,this.activeActionPoint);
			}else this.parent.actions[ this.parent.action ].mouseUp.call(this.parent.actions);
			this.mousePressed 	  = false;
			this.drag 			  = false;
			this.actionPointPress = false;
			this.actionPointDrag  = false;
			this.parent.render();
			this.parent.draw.ui();
			this.parent.draw.toolbar();
			this.onCanvasMouseUp();
			this.parent.onMouseUp();
		},

		mouseMove : function( e )
		{
			this.parent.helpers.getMousePosition( e );

			if( this.prevMoveX == this.mouseX && 
				this.prevMoveY == this.mouseY ) return;

			this.prevMoveX = this.mouseX;
			this.prevMoveY = this.mouseY;

			if( this.mousePressed ) this.drag = true; else this.drag = false;
			if(this.editMode && (this.actionPointPress) )
			{
				if(this.actionPointPress) this.actionPointDrag = true;
				this.parent.actions[ this.activeActionPoint.objectType ].actionPointMove.call(this.parent.actions,this.activeActionPoint);
			}else this.parent.actions[ this.parent.action ].mouseMove.call(this.parent.actions);
			this.parent.render();
			this.parent.onMouseMove();
		},

		keyDown : function( e )
		{

			this.onMouseDown( e );

			if($("input:focus, textarea:focus, select:focus").length) return;
			var p = false;

			keyCode = e.keyCode;

			if(!this.addToPressed( keyCode )) return;

			this.setSpecialKeys( keyCode, true );

			for(i in this.keyboardEvents)
			{
				var found 		  = [],
					keyboardEvent = this.keyboardEvents[i],
					keys 		  = keyboardEvent.shortcut.split('+');

				for(i in keys) if( this.isPressed(keys[i]) ) found.push( true );
				if(found.length && found.length == keys.length && !p)
				{
					p = true;
					$.proxy(keyboardEvent.action,keyboardEvent.scope,keyboardEvent.args)();
				}
			}

			if(p) e.preventDefault(); e.stopPropagation();

			this.parent.onKeyDown();
		},

		keyUp : function( e )
		{
			if($("input:focus, textarea:focus, select:focus").length) return;
			var p = false;
			keyCode = e.keyCode;
			this.setSpecialKeys( keyCode, false );
			this.clearPressed( keyCode );
			if(p) e.preventDefault(); e.stopPropagation();
			this.parent.onKeyUp();
		},

		addToPressed : function( keyCode )
		{
			var flag = true;
			for(i in this.pressed) if(this.pressed[i] == keyCode) flag = false;
			if(flag) this.pressed.push(keyCode);
			return flag;
		},

		isPressed : function( keyCode )
		{
			keyCode = keyCode.replace(' ','');
			if( String(keyCode).search('shift')       == 0 ) keyCode = 16;
			if( String(keyCode).search('ctrl')        == 0 ) keyCode = 17;
			if( String(keyCode).search('alt')         == 0 ) keyCode = 18;
			if( String(keyCode).search('backspace')   == 0 ) keyCode =  8;
			if( String(keyCode).search('tab')	      == 0 ) keyCode =  9;
			if( String(keyCode).search('enter')	      == 0 ) keyCode = 13;
			if( String(keyCode).search('pause')	      == 0 ) keyCode = 19;
			if( String(keyCode).search('caps lock')   == 0 ) keyCode = 20;
			if( String(keyCode).search('escape')	  == 0 ) keyCode = 27;
			if( String(keyCode).search('page up')     == 0 ) keyCode = 33;
			if( String(keyCode).search('page down')   == 0 ) keyCode = 34;
			if( String(keyCode).search('end')	      == 0 ) keyCode = 35;
			if( String(keyCode).search('home')	      == 0 ) keyCode = 36;
			if( String(keyCode).search('left')        == 0 ) keyCode = 37;
			if( String(keyCode).search('up')	      == 0 ) keyCode = 38;
			if( String(keyCode).search('right')       == 0 ) keyCode = 39;
			if( String(keyCode).search('down')        == 0 ) keyCode = 40;
			if( String(keyCode).search('insert')	  == 0 ) keyCode = 45;
			if( String(keyCode).search('del')	      == 0 ) keyCode = 46;

			for(i in this.pressed) {
				if(typeof keyCode == 'string' && String.fromCharCode(this.pressed[i]).toLowerCase() == keyCode) return true;
				else if(this.pressed[i] == keyCode) return true;
			}
		},

		clearPressed : function( keyCode )
		{
			for(i in this.pressed) if(this.pressed[i] == keyCode) this.pressed.splice(i,1);
		},

		setSpecialKeys : function( keyCode, on ){
			if(keyCode == 16) this.shift = on;
			if(keyCode == 17) this.ctrl  = on;
			if(keyCode == 18) this.alt   = on;
		},

		edit : function( e ){

			b = $(e.target);
			b.toggleClass('active');
			this.editMode = b.hasClass('active');
			this.parent.render();

		},

		exitEditMode : function(){
			this.editMode       = false;
			selectedActionPoint = null;
			activeActionPoint   = {};
			$('.toolbar .edit').removeClass('active');
		},

		toolButton : function( e )
		{
			if( this.simpleTools.indexOf($(e.target).attr('id')) != -1 ){
				this.parent.actions[ $(e.target).attr('id') ]();
				return;
			}
			$('.tools .button').removeClass('active');
			$(e.target).addClass('active');
			this.exitEditMode();
			this.endCreatePath();
			this.parent.action = $(e.target).attr('id');
			this.parent.render();
			this.parent.draw.ui();
			this.parent.draw.toolbar();
			this.parent.onToolChange();
		},

		endCreatePath : function(){
			this.createPathMode = false;
		},

		removeDuplicateKeyboardEvents : function(){
			for(i in this.keyboardEvents)
			{
				var flag = 0;
				for(x in this.keyboardEvents)
				{
					if(this.keyboardEvents[i].shortcut == this.keyboardEvents[x].shortcut) flag ++ ;
					if(flag > 1) {
						this.keyboardEvents.splice(x,1);
						flag = 0;
					}
				}
			}
		},

		addToolsEvents : function(){ $('.tools .button').unbind('click').bind('click', $.proxy(this.toolButton,this) ); },

		browserDrop : function( e ){         for(i in this.browserDropEvents) this.browserDropEvents[i]( e ); },
		canvasDrop  : function( event, ui ){ for(i in this.canvasDropEvents)  this.canvasDropEvents[i]( event, ui ); },

		positionCanvas : function(){
			this.parent.helpers.positionCanvas( this.parent.width, this.parent.height );
		}

	},

	on : function( events, selector, callback ){ this.events.on( events, selector, callback ); }

});