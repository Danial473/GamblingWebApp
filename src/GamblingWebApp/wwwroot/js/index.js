//country layout stuff

var country = 'US'; // change this - normal options US or EU (XX will show how it works with for example a custom 4 number layout)

var countryNumbers = {};

countryNumbers['US'] = ['0', 28, 9, 26, 30, 11, 7, 20, 32, 17, 5, 22, 34, 15, 3, 24, 36, 13, 1, '00', 27, 10, 25, 29, 12, 8, 19, 31, 18, 6, 21, 33, 16, 4, 23, 35, 14, 2],
countryNumbers['EU'] = ['0', 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26],
countryNumbers['XX'] = ['0',1,2,3];

var numbers = countryNumbers[country];

var segments = numbers.length;

// other variables

var spinning = false,
	speed = 1, 
	angle = 0,
	count = 0,
	imageData,
	click = [],
	release = [],
	canvas = document.getElementById('canvas'),
	context = canvas.getContext('2d');

//functions

function drawCircle(x, y, radius, color, fill) {
	context.beginPath();
	context.arc(x, y, radius, 0, Math.PI * 2, true);
	context.strokeStyle=color;
	context.stroke();
	if (fill) {
		context.fillStyle=fill;
		context.fill();
	}
}

function drawRectangle(x1, y1, x2, y2, square, color) {
	if (square) {
		y2 = y1+(x2-x1);
	}
	context.beginPath();
	context.moveTo(x1, y1);
	context.lineTo(x1, y2);
	context.lineTo(x2, y2);
	context.lineTo(x2, y1);
	context.lineTo(x1, y1);
	context.strokeStyle=color;
	context.stroke();
}

function drawPie(x,y,radius,segmentAngleRadians,color,fill){
	context.beginPath();
	context.lineWidth=1;
	var angleRadians = angle/180*Math.PI;
	var startAngle = (1.5*Math.PI) - segmentAngleRadians/2
	var endAngle = (1.5*Math.PI) + segmentAngleRadians/2
	context.arc(x, y, radius, startAngle, endAngle, false);
	context.lineTo(x, y);
	context.strokeStyle=color;
	context.stroke();
	if (fill) {
		context.fillStyle=fill;
		context.fill();
	}
}

function drawBoard(x,y,radius){

	// set some variables for the proportions

	var r = radius, 	// outer radius
		r1 = 0.9 * r, 	// radius of ring below numbers
		r2 = 0.8 * r, 	// radius of ring below red/black
		r3 = 0.5 * r, 	// radius of ring around gold dome
		r4 = 0.15 * r, 	// radius of center piece

		f = parseInt(0.07 * r), // font size px

		sl = 1/3 * r, // length of crossbars
		sw = 1/60 * r; // width of crossbars

	var segmentAngleRadians = 360/segments/180*Math.PI;
	for (var i = 0 ; i < segments ; i++) {
		if (numbers[i]==='0' || numbers[i]==='00') {
			color = 'green';
		}
		else if (i%2) {
			color = 'red';
		}
		else {
			color = 'black';
		}
		drawPie(x,y,r,segmentAngleRadians,'black');
		drawPie(x,y,r,segmentAngleRadians,'black',color);
		context.fillStyle = 'white';
		context.font = f+5+'px sans-serif';
		context.fillText(numbers[i],r-0.6*f-2,f+4); // these last two variables control the placement of the numbers in the cells in x and y
		context.translate(x,y);
		context.rotate(segmentAngleRadians);
		context.translate(-x,-y);
	}
	context.lineWidth=5;
	gradient = context.createRadialGradient(x, y, 0, x, y,r); 
 
	drawCircle(x,y,r2,'black',gradient);
	for (var j = 0 ; j < segments ; j++) {
		drawPie(x,y,r2,segmentAngleRadians,'black',false);
		context.translate(x,y);
		context.rotate(segmentAngleRadians);
		context.translate(-x,-y);
	}
	gradient = context.createRadialGradient(x, y, 0, x, y,0.4*r); 
	context.lineWidth=2;
	drawCircle(x,y,r3,'black',gradient);

	//add center decoration
	context.lineWidth=1;
	drawRectangle(x-sw,y-sl,x+sw,y+sl,false,'black');
	drawRectangle(x-sl,y-sw,x+sl,y+sw,false,'black');
	drawCircle(x,y,r4,'black',gradient);
}

function spin(){
	if (spinning) {
	    angle = angle - speed;
	    if (angle < 0) {
	        angle = 359;
	    }
	    $('canvas').css('transform', 'rotate(' + angle + 'deg)');
	    $('#angle').html(angle);
		//decelerate a little on every rotation
		speed = speed - speed*0.003;
		if (speed<0.5) { speed = speed - speed*0.1; } //and a little faster at the end
		if (speed<0.1) { speed = speed - speed*0.2; } //and some more to force a halt
		
		if (speed < 0) {
		    speed = 0;  
		}

		if (speed != 0) {
		    window.requestAnimationFrame(spin);
		}
		else
		{
		    $.ajax({
		        url: '<%= Url.Action("ShowRoulette") %>',
		        type: 'POST',
		        data: { input: angle },
		        success: function (result) {
		            $('#angle').html(result);
		        },
		        error: function () {
		            alert("error");
		        }
		    });
		}
	}
}

//control handlers

$('#reset').on('click',function(){
		spinning = false;
		speed = 5; 
		$('#angle').html(angle);
		$('canvas').css('transform', 'rotate(' + angle + 'deg)');

		if (!spinning) { 
		    spinning = true;
		    window.requestAnimationFrame(spin);
		}
});

//do it

drawBoard(100,100,100); 