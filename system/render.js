
$.extend( true, Designer, {

	render : function()
	{

		//this.helpers.timer('start','render');

		var focusedInputs = $("input:focus");
		var inputHasFocus = false;
		if (focusedInputs != null && focusedInputs.length > 0) { inputHasFocus = true; }

		this.draw.clearCanvas();
		this.draw.objects();
		this.draw.selectedBox();
		this.draw.selectionBox();
		if(this.events.editMode) this.draw.actionPoints();
		if(this.events.transformMode) this.draw.transformationBox();
		if(this.events.eyeDropperGuide) this.draw.eyeDropperGuide();
		if(this.events.cropMode) this.draw.cropArea();

		this.events.onRender();

		//this.helpers.timer('stop','render');

	},

	redraw : function(){
		this.render(); 
		this.draw.ui();
		this.draw.toolbar();
		this.ui.tools.init();
		this.ui.toolbars.init();
		this.ui.toolboxes.init();
		this.ui.sidebars.init();
	},

	draw : {

		clearCanvas : function( ctx )
		{
			if(!ctx) ctx = this.parent.ctx;
			ctx.clearRect(0, 0, this.parent.canvas.width, this.parent.canvas.height);
		},

		resetHelperCanvas : function(){
			$('#helperCanvas').attr( 'width',  this.parent.width );
			$('#helperCanvas').attr( 'height', this.parent.height );
			this.clearCanvas( this.parent.helperCtx );
		},

		grid : function()
		{

			this.parent.gridCtx.clearRect(0, 0, this.parent.width, this.parent.height);

			if(this.parent.grid.visible)
			{

				var gridSteps = this.parent.width / this.parent.grid.size,
					size 	  = this.parent.grid.size;

				this.parent.gridCtx.beginPath();

				for(var i = 0; i <= gridSteps; i++ )
				{
					this.parent.gridCtx.moveTo( i * size + 0.5, 0 );
					this.parent.gridCtx.lineTo( i * size + 0.5, this.parent.height );
					this.parent.gridCtx.moveTo( 0, i * size + 0.5 );
					this.parent.gridCtx.lineTo( this.parent.width, i * size + 0.5 );
				}

				this.parent.gridCtx.lineWidth   = 0.2;//this.parent.grid.lineWidth;
				this.parent.gridCtx.strokeStyle = '#777';//this.parent.grid.strokeStyle;
				this.parent.gridCtx.stroke();
			}	
		},

		objects : function( ctx )
		{
			this.parent.helpers.forEachObjects($.proxy(function( object ) { this.drawObject( object, ctx ); },this));
		},

		drawObject : function( object, ctx ){

			this.current = object;

			if(object.visible == false || object.parentInvisible) return;

			if(!ctx) ctx = this.parent.ctx;

			ctx.globalAlpha = 1;

			o = object;

			if( o.type == 'box' )
			{
				var x 			  = o.startX,
					y 			  = o.startY,
					width 		  = o.width,
					height 		  = o.height,
					radius    	  = o.radius,
					lineWidth     = o.lineWidth,
					strokeStyle   = o.strokeStyle,
					fill          = o.fill,
					rotate        = o.rotate,
					shadowBlur    = o.shadowBlur,
					shadowOffsetX = o.shadowOffsetX,
					shadowOffsetY = o.shadowOffsetY,
					shadowColor   = o.shadowColor,
					opacity       = o.opacity,
					gradient      = o.gradient;

				o.endX = x + width;
				o.endY = y + height;

				if(opacity) ctx.globalAlpha = opacity;

				ctx.shadowBlur    = shadowBlur;
				ctx.shadowOffsetX = shadowOffsetX;
				ctx.shadowOffsetY = shadowOffsetY;
				ctx.shadowColor   = shadowColor;

				ctx.save();
				ctx.translate( x+(width/2),y+(height/2) );
				ctx.rotate(rotate*Math.PI/180);
				ctx.translate( -(x+(width/2)),-(y+(height/2)) );

				if( o.src ) 
				{
					image     = new Image();
					image.src = o.src;
					ctx.drawImage(image, x, y, width, height);
				}
				else this.rect( ctx, x, y, width, height, radius, lineWidth, strokeStyle, fill, true, opacity, gradient );

				ctx.restore();

			}
			if( o.type == 'text' )
			{
				var isItalic = '', 
					isBold   = '';

				if(o.isBold)   isBold   = 'bold';
				if(o.isItalic) isItalic = 'italic';

				if(o.opacity) ctx.globalAlpha = o.opacity;

				ctx.lineWidth     = o.lineWidth;
				ctx.strokeStyle   = o.strokeStyle;
				ctx.fillStyle     = o.fillStyle;
				ctx.font          = isItalic + ' ' + isBold + ' ' + o.fontSize + 'px ' + o.font;
				ctx.shadowColor   = o.shadowColor;
				ctx.shadowBlur    = o.shadowBlur;
				ctx.shadowOffsetX = o.shadowOffsetX;
				ctx.shadowOffsetY = o.shadowOffsetY;

				ctx.textBaseline  = "top";

				var x 	   = o.startX,
					y 	   = o.startY,
					width  = ctx.measureText(o.text).width,
					height = Number(o.fontSize),
					rotate = o.rotate;

				ctx.save();
				// if(o.matrix) 
				// {
				// 	m = o.matrix.split(',');
				// 	ctx.transform(m[0],m[1],m[2],m[3],m[4],m[5]); // todo: compute width / height with matrix
				// }
				ctx.translate( x+(width/2),y+(height/2) );
				ctx.rotate(rotate*Math.PI/180);
				ctx.translate( -(x+(width/2)),-(y+(height/2)) );

				if(!o.lineWidth) ctx.fillText(o.text, x, y);
				else
				{
					if(o.fillStyle) ctx.fillText(o.text, x, y);
					ctx.strokeText(o.text, x, y);
				}

				o.width  = ctx.measureText(o.text).width;
				o.height = Number(o.fontSize);
				o.endX   = o.startX + o.width;
				o.endY   = o.startY + Number(o.fontSize);

				ctx.restore();

				ctx.shadowColor   = 0;
				ctx.shadowBlur    = 0;
				ctx.shadowOffsetX = 0;
				ctx.shadowOffsetY = 0;

			}
			if( o.type == 'path' )
			{
				// translated from svg
				var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
				$(path).attr('d',o.path);
				if(!o.startX)
				{
					init = true;
					pathInfo       = this.parent.helpers.getSvgPathInfo( path );
					o.startX       = path.pathSegList.getItem(0).x;
					o.startY       = path.pathSegList.getItem(0).y;
					o.topLeftX     = pathInfo.x;
					o.topLeftY     = pathInfo.y;
					o.bottomRightX = pathInfo.x + pathInfo.w;
					o.bottomRightY = pathInfo.y + pathInfo.h;
					o.width        = pathInfo.w;
					o.height       = pathInfo.h;
				}

				x = o.startX;
				y = o.startY;
				w = o.width;
				h = o.height;

				pathInfo       = this.parent.helpers.getSvgPathInfo( path );
				o.topLeftX     = pathInfo.x;
				o.topLeftY     = pathInfo.y;
				o.bottomRightX = pathInfo.x + pathInfo.w;
				o.bottomRightY = pathInfo.y + pathInfo.h;
				o.width        = pathInfo.w;
				o.height       = pathInfo.h;

				if(o.opacity) ctx.globalAlpha = o.opacity;

				ctx.save();
				ctx.translate( o.topLeftX+(w/2),o.topLeftY+(h/2) );
				ctx.rotate(o.rotate*Math.PI/180);
				ctx.translate( -(o.topLeftX+(w/2)),-(o.topLeftY+(h/2)) );

				path.pathSegList.getItem(0).x = x;
				path.pathSegList.getItem(0).y = y;

				o.path = path.getAttribute('d');

				ctx.beginPath();
				ctx.lineWidth   = o.lineWidth;
				ctx.strokeStyle = o.strokeStyle;
				ctx.fillStyle   = o.fillStyle;

				ctx.shadowBlur    = o.shadowBlur;
				ctx.shadowOffsetX = o.shadowOffsetX;
				ctx.shadowOffsetY = o.shadowOffsetY;
				ctx.shadowColor   = o.shadowColor;
				
				this.path(ctx,path);

				if (o.gradient){
					if(!o.gradient.coordinates) coordinates = [o.topLeftX+(o.width/2),o.topLeftY,o.topLeftX+(o.width/2),o.topLeftY+o.height];
					var gx1 = coordinates[0], gy1 = coordinates[1], gx2 = coordinates[2], gy2 = coordinates[3];
					var grd = ctx.createLinearGradient(gx1,gy1,gx2,gy2);
					for(i=0;i<o.gradient.stops.length;i++) {
						var stop = o.gradient.stops[i];
						grd.addColorStop(stop.position,stop.color);
					}
					ctx.fillStyle = grd;
					ctx.fill();
					var noFill = true;
				}
				if (o.fillStyle && !noFill) { ctx.fillStyle = fill; ctx.fill(); }
				if (o.strokeStyle && o.lineWidth) ctx.stroke();

				ctx.restore();
			}
			if( o.type == 'ellipse' )
			{
				o = o;

				o.startX = o.cx - o.rx/2;
				o.endX   = o.cx + o.rx/2;
				o.startY = o.cy - o.ry/2;
				o.endY   = o.cy + o.ry/2;
				o.width  = o.endX - o.startX;
				o.height = o.endY - o.startY;

				ctx.save();
				ctx.translate( o.cx,o.cy );
				ctx.rotate(o.rotate*Math.PI/180);
				ctx.translate( -o.cx,-o.cy );

				ctx.shadowBlur    = o.shadowBlur;
				ctx.shadowOffsetX = o.shadowOffsetX;
				ctx.shadowOffsetY = o.shadowOffsetY;
				ctx.shadowColor   = o.shadowColor;

				this.drawEllipseByCenter(ctx, o.cx, o.cy, o.rx, o.ry, o.lineWidth, o.strokeStyle, o.fillStyle, o.stroke, o.gradient);	

				ctx.restore();
			}
			if( o.type == 'circle' )
			{
				o = o;
				o.cx = o.startX + o.r;
				o.cy = o.startY + o.r;

				ctx.shadowBlur    = o.shadowBlur;
				ctx.shadowOffsetX = o.shadowOffsetX;
				ctx.shadowOffsetY = o.shadowOffsetY;
				ctx.shadowColor   = o.shadowColor;

				ctx.beginPath();
				ctx.arc(o.cx, o.cy, o.r, 0, 2 * Math.PI, false);
				ctx.fillStyle = o.fill;
				ctx.fill();
				ctx.lineWidth   = o.lineWidth;
				ctx.strokeStyle = o.strokeStyle;
				if (o.fillStyle) { ctx.fillStyle = fill; ctx.fill(); }
				if (o.strokeStyle && o.lineWidth) ctx.stroke();
			}
			if( o.type == 'line' )
			{
				o = o;

				o.width  = o.endX - o.startX ;
				o.height = o.endY - o.startY ;

				c = {
					x : o.startX + (o.width/2),
					y : o.startY + (o.height/2)
				}

				ctx.save();
				ctx.translate( c.x,c.y );
				ctx.rotate(o.rotate*Math.PI/180);
				ctx.translate( -c.x,-c.y );

				ctx.shadowBlur    = o.shadowBlur;
				ctx.shadowOffsetX = o.shadowOffsetX;
				ctx.shadowOffsetY = o.shadowOffsetY;
				ctx.shadowColor   = o.shadowColor;

				ctx.beginPath();
				ctx.moveTo(o.startX + 0.5, o.startY + 0.5);
				ctx.lineTo(o.endX + 0.5, o.endY + 0.5);
				ctx.lineWidth   = o.lineWidth;
				ctx.strokeStyle = o.strokeStyle;
				if (o.strokeStyle && o.lineWidth) ctx.stroke();

				ctx.restore();
			}
		},

		rect : function( ctx, x, y, w, h, radius, lineWidth, strokeStyle, fill, stroke, opacity, gradient ) {

			if (typeof stroke == "undefined" ) stroke = true;
			if (typeof radius === "undefined") radius = 5;

			ctx.beginPath();
			ctx.moveTo(x + radius, y);
			ctx.lineTo(x + w - radius, y);
			ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
			ctx.lineTo(x + w, y + h - radius);
			ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
			ctx.lineTo(x + radius, y + h);
			ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
			ctx.lineTo(x, y + radius);
			ctx.quadraticCurveTo(x, y, x + radius, y);
			ctx.closePath();
			ctx.globalAlpha = opacity;
			ctx.lineWidth = Number(lineWidth);
			ctx.strokeStyle = strokeStyle;

			if (strokeStyle && lineWidth) ctx.stroke();
			if (gradient){
				if(!gradient.coordinates) coordinates = [x+(w/2),y,x+(w/2),y+h];
				var gx1 = coordinates[0], gy1 = coordinates[1], gx2 = coordinates[2], gy2 = coordinates[3];
				var grd = ctx.createLinearGradient(gx1,gy1,gx2,gy2);
				for(i=0;i<gradient.stops.length;i++) {
					var stop = gradient.stops[i];
					grd.addColorStop(stop.position,stop.color);
				}
				ctx.fillStyle = grd;
				ctx.fill();
				return;
			}
			if (fill) { ctx.fillStyle = fill; ctx.fill(); }

		},

		ellipse : function(ctx, x, y, w, h, lineWidth, strokeStyle, fill, stroke, gradient) {
			var kappa = .5522848,
				ox = (w / 2) * kappa, // control point offset horizontal
				oy = (h / 2) * kappa, // control point offset vertical
				xe = x + w,           // x-end
				ye = y + h,           // y-end
				xm = x + w / 2,       // x-middle
				ym = y + h / 2;       // y-middle

			ctx.beginPath();
			ctx.moveTo(x, ym);
			ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
			ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
			ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
			ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
			ctx.lineWidth = Number(lineWidth);
			ctx.strokeStyle = strokeStyle;
			ctx.closePath(); // not used correctly, see comments (use to close off open path)
			if (strokeStyle && lineWidth) ctx.stroke();
			if (gradient){
				if(!gradient.coordinates) coordinates = [x+(w/2),y,x+(w/2),y+h];
				var gx1 = coordinates[0], gy1 = coordinates[1], gx2 = coordinates[2], gy2 = coordinates[3];
				var grd = ctx.createLinearGradient(gx1,gy1,gx2,gy2);
				for(i=0;i<gradient.stops.length;i++) {
					var stop = gradient.stops[i];
					grd.addColorStop(stop.position,stop.color);
				}
				ctx.fillStyle = grd;
				ctx.fill();
				return;
			}
			if (fill) { ctx.fillStyle = fill; ctx.fill(); }

		},

		drawEllipseByCenter : function(ctx, cx, cy, w, h, lineWidth, strokeStyle, fill, stroke, gradient) {
			this.ellipse(ctx, cx - w/2.0, cy - h/2.0, w, h, lineWidth, strokeStyle, fill, stroke, gradient);
		},

		arc : function(ctx, x1, y1, x2, y2, radius, clockwise) {
			var cBx = (x1 + x2) / 2;    //get point between xy1 and xy2
			var cBy = (y1 + y2) / 2;
			var aB = Math.atan2(y1 - y2, x1 - x2);  //get angle to bulge point in radians
			if (clockwise) { aB += (90 * (Math.PI / 180)); }
			else { aB -= (90 * (Math.PI / 180)); }
			var op_side = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)) / 2;
			var adj_side = Math.sqrt(Math.pow(radius, 2) - Math.pow(op_side, 2));
			if (isNaN(adj_side))  adj_side = Math.sqrt(Math.pow(op_side, 2) - Math.pow(radius, 2));
			var Cx = cBx + (adj_side * Math.cos(aB));            
			var Cy = cBy + (adj_side * Math.sin(aB));
			var startA = Math.atan2(y1 - Cy, x1 - Cx);       //get start/end angles in radians
			var endA = Math.atan2(y2 - Cy, x2 - Cx);
			var mid = (startA + endA) / 2;
			var Mx = Cx + (radius * Math.cos(mid));
			var My = Cy + (radius * Math.sin(mid));
			ctx.arc(Cx, Cy, radius, startA, endA, clockwise);
		},

		path : function(ctx,path){

			cx = 0;
			cy = 0;

			pathLength = path.pathSegList.length || path.pathSegList.numberOfItems;

			for(i=0;i<=pathLength-1;i++)
			{
				seg = path.pathSegList.getItem(i);

				nx = cx;
				ny = cy;

				if(seg.x) cx = cx + seg.x;
				if(seg.y) cy = cy + seg.y;

				switch(seg.pathSegTypeAsLetter)
				{
					case 'm' :
						ctx.moveTo(cx, cy);
						break;
					case 'l' :
						ctx.lineTo(cx, cy);
						break;
					case 'a' :
						x = nx + seg.x;
						y = ny + seg.y;
						this.arc(ctx,nx,ny,x,y,seg.r2);
						break;
					case 'c' :
						cx1 = nx + seg.x1;
						cx2 = nx + seg.x2;
						cy1 = ny + seg.y1;
						cy2 = ny + seg.y2;
						ctx.bezierCurveTo(cx1,cy1,cx2,cy2,cx,cy);
						break;
					case 'q' :
						cx1 = nx + seg.x1;
						cy1 = ny + seg.y1;
						ctx.quadraticCurveTo(cx1,cy1,cx,cy);
						break;
					case 'Z' :
						ctx.closePath();
						break;
					case 'z' :
						ctx.closePath();
						break;
				}
				
			}

		},

		selectedBox : function(){
			for(i in this.parent.selecteds)
			{
				if(this.parent.selecteds[i].id == this.tempObject) return;
				if(this.parent.selecteds[i].type != 'text') return;
				var o  = this.parent.selecteds[i],
					x  = o.startX,
					y  = o.endY,
					w  = o.width,
					h  = o.height,
					cx = o.width / 2,
					cy = o.height / 2,
					r  = o.rotate;
				this.parent.ctx.save();
				this.parent.ctx.translate( x + cx, y - cy );
				this.parent.ctx.rotate(r*Math.PI/180);
				this.parent.ctx.translate( -(x + cx), -(y + cy) );
				this.parent.ctx.beginPath();
				this.parent.ctx.rect( x, y, w, h );
				this.parent.ctx.lineWidth   = 2;
				this.parent.ctx.strokeStyle = '#ccc';
				this.parent.ctx.stroke();
				this.parent.ctx.restore();
			}
		},

		selectionBox : function(){
			if(this.parent.selectionBox.endX != null)
			{
				var x1 = this.parent.selectionBox.startX,
					y1 = this.parent.selectionBox.startY,
					x2 = this.parent.selectionBox.endX,
					y2 = this.parent.selectionBox.endY;
				this.parent.ctx.beginPath();
				this.parent.ctx.setLineDash([6]);
				this.parent.ctx.lineWidth   = this.parent.selectionBox.lineWidth;
				this.parent.ctx.strokeStyle = this.parent.selectionBox.strokeStyle;
				this.parent.ctx.rect( x1-0.5, y1-0.5, (x2 - x1), (y2 - y1) );
				this.parent.ctx.stroke();
				this.parent.ctx.setLineDash([0]);	
			}
		},

		transformationBox : function(){

			transformDimensions = this.parent.helpers.getTransformDimensions();

			x1 = transformDimensions.x1;
			x2 = transformDimensions.x2;
			y1 = transformDimensions.y1;
			y2 = transformDimensions.y2;
			cx = transformDimensions.c.x;
			cy = transformDimensions.c.y;

			this.parent.ctx.beginPath();
			this.parent.ctx.moveTo(x1,y1);
			this.parent.ctx.lineTo(x1,y2);
			this.parent.ctx.lineTo(x2,y2);
			this.parent.ctx.lineTo(x2,y1);
			this.parent.ctx.lineTo(x1,y1);
			this.parent.ctx.lineWidth = 1;
			this.parent.ctx.strokeStyle = 'orange';
			this.parent.ctx.stroke();

			this.quickPoint(x1,y1);
			this.quickPoint(x1,y2);
			this.quickPoint(x2,y1);
			this.quickPoint(x2,y2);
			this.quickPoint(cx,cy);

		},

		actionPoints : function()
		{
			for(i in this.parent.selecteds)
			{
				object = this.parent.functions.getObject( this.parent.selecteds[i].id );

				actionPoints = this.parent.helpers.getActionPoints( object );
				for(i in actionPoints)
				{
					p = actionPoints[i];
					this.parent.ctx.beginPath();
					this.parent.ctx.arc(p.x, p.y, this.parent.defaults.actionPoint.size, 0, 2 * Math.PI, false);
					this.parent.ctx.lineWidth   = this.parent.defaults.actionPoint.lineWidth;
					this.parent.ctx.strokeStyle = this.parent.defaults.actionPoint.strokeStyle;
					this.parent.ctx.stroke();
				}
				if(this.parent.events.actionPointPress || this.parent.helpers.isOverActionPoint()) $('.stage').addClass('pointer')
				else $('.stage').removeClass('pointer');

				if(this.parent.events.selectedActionPoint)
				{
					var p = this.parent.events.selectedActionPoint;
					this.quickPoint(p.target.x,p.target.y)
				}

			}
				
		},

		eyeDropperGuide : function(){
			ctx = this.parent.ctx;
			x = this.parent.events.mouseX - 20;
			y = this.parent.events.mouseY - 20;
			w = 20;
			h = 20;
			radius = 0;
			lineWidth = 1;
			strokeStyle = '#000';
			fill = this.parent.color1;
			stroke = 1;
			opacity = 1;
			this.rect( ctx, x+0.5, y+0.5, w, h, radius, lineWidth, strokeStyle, fill, stroke, opacity );
		},

		cropArea : function(){

			
			var sw = this.parent.width,
				sh = this.parent.height,
				x1 = this.parent.actions.crop.x1,
				y1 = this.parent.actions.crop.y1,
				x2 = this.parent.actions.crop.x2,
				y2 = this.parent.actions.crop.y2,
				w  = x2 - x1,
				h  = y2 - y1;

			if(!x1 || !x2 || !y1 || !y2) return;

			this.parent.ctx.beginPath();
			this.parent.ctx.rect( 0, 0, sw, y1 );
			this.parent.ctx.rect( 0, y1, x1, h );
			this.parent.ctx.rect( x2, y1, (sw - w - x1), h );
			this.parent.ctx.rect( 0, y2, sw, (sh - h - y1) );

			this.parent.ctx.fillStyle = 'rgba(0,0,0,0.8)';
			this.parent.ctx.fill();
		},

		point : function(x,y,data){
			this.parent.ctx.beginPath();
			this.parent.ctx.fillStyle = data.fillStyle;
			this.parent.ctx.arc(x, y, 5, 0, 2 * Math.PI, false);
			this.parent.ctx.fill();
		},

		quickPoint : function(x,y,color){
			this.parent.ctx.beginPath();
			this.parent.ctx.arc(x, y, 5, 0, 2 * Math.PI, false);
			this.parent.ctx.lineWidth = 3;
			this.parent.ctx.strokeStyle = color || 'orange';
			this.parent.ctx.stroke();
		},

		box : function(x1,y1,x2,y2){
			w = x2-x1;
			h = y2-y1;
			this.parent.ctx.beginPath();
			this.parent.ctx.rect(x1, y1, w, h);
			this.parent.ctx.lineWidth = 3;
			this.parent.ctx.strokeStyle = 'black';
			this.parent.ctx.stroke();
		},

		boxWH : function(x,y,w,h){
			this.parent.ctx.beginPath();
			this.parent.ctx.rect(x, y, w, h);
			this.parent.ctx.lineWidth = 1;
			this.parent.ctx.strokeStyle = 'black';
			this.parent.ctx.stroke();
		},

		transformClone : function(){
			tc = this.transformClone;
			this.parent.ctx.beginPath();
			this.parent.ctx.rect( tc.startX, tc.startY, tc.width, tc.height );
			this.parent.ctx.lineWidth   = 1;
			this.parent.ctx.strokeStyle = 'green';
			this.parent.ctx.stroke();
		},

		ui : function(){

			//this.parent.helpers.timer('start','ui');

			this.parent.helpers.getToolbox('objects').redraw();
			this.parent.helpers.getToolbox('resources').redraw();

			//this.parent.helpers.timer('stop','ui');

		},

		toolbar : function(){

			$('.toolbar').hide();

			if(this.parent.action != 'path') $('.listOfShapes').hide();

			if(this.parent.selecteds.length && this.parent.action != 'move')
			{
				var flag = false;

				if(this.parent.helpers.selectedIs('text'))     { this.parent.functions.edit('text');    flag = true; }
				if(this.parent.helpers.selectedIs('box'))      { this.parent.functions.edit('box');     flag = true; }
				if(this.parent.helpers.selectedIs('line'))     { this.parent.functions.edit('line');    flag = true; }
				if(this.parent.helpers.selectedIs('ellipse'))  { this.parent.functions.edit('ellipse'); flag = true; }
				if(this.parent.helpers.selectedIs('path'))     { this.parent.functions.edit('path');    flag = true; }

				if(this.parent.action != 'select') {
					$('.toolbar').hide();
					$('.toolbox.text').hide();
					flag = false;
				}

				if(this.parent.selecteds.length     && 
				   this.parent.selecteds.length > 1 && 
				   this.parent.action == 'select'   &&
				   !flag) { $('.toolbar.selectMultiple').show(); flag = true; }

				if(!flag) $('.toolbar.'+this.parent.action).show();

			}
			else $('.toolbar.'+this.parent.action).show();

		},

	}	
	
})