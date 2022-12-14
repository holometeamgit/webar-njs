let draw = {}

draw.drawCvpointsInCtx = function(cvPoints, color, size){
	drawCanvasCtx.fillStyle = `rgb(
        ${Math.floor(color[0])},
        ${Math.floor(color[1])},
        ${Math.floor(color[2])})`;
	// vidWidth, vidHeight
	for (var i = 0; i < cvPoints.rows; i++) {
		let canvasX = cvPoints.data32F[ i * 2 ] / vidWidth * drawCanvas.width
		let canvasY = cvPoints.data32F[ i * 2 + 1 ] / vidHeight * drawCanvas.height
		drawCanvasCtx.fillRect(canvasX - size/2, canvasY - size/2, size, size);
	}
}

draw.clearCanvas = function(){
	drawCanvasCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
}

draw.drawPointInCtx = function(x, y, size, rgb){
	drawCanvasCtx.fillStyle = `rgb(
        ${Math.floor(rgb[0])},
        ${Math.floor(rgb[1])},
        ${Math.floor(rgb[2])})`;
    let canvasX = x / vidWidth * drawCanvas.width
	let canvasY = y / vidHeight * drawCanvas.height
    drawCanvasCtx.fillRect(canvasX - size/2, canvasY - size/2, size, size);
}

draw.drawCvpoint = function(image, point, radius, rgb){
	let color = new cv.Scalar(rgb[0], rgb[1], rgb[2]);
	let center = new cv.Point( Math.ceil( point.data32F[0] ), Math.ceil( point.data32F[1] ) );
	cv.circle(image, center, radius, color, 3);
}

draw.drawCvpoints = function(image, point, radius, rgb){
	let color = new cv.Scalar(rgb[0], rgb[1], rgb[2]);
	let center = new cv.Point( Math.ceil( point.data32F[0] ), Math.ceil( point.data32F[1] ) );
	cv.circle(image, center, radius, color, 3);
}


draw.drawJspointsInCtx = function(points, size, rgb){
	drawCanvasCtx.fillStyle = `rgb(
        ${Math.floor(rgb[0])},
        ${Math.floor(rgb[1])},
        ${Math.floor(rgb[2])})`;

	// drawCanvasCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
	for (var i = 0; i < points.length; i++) {
		let canvasX = points[i][0] / vidWidth * drawCanvas.width
		let canvasY = points[i][1] / vidHeight * drawCanvas.height
		drawCanvasCtx.fillRect(canvasX - size/2, canvasY - size/2, size, size);
	}
}

draw.addTextCv = function(image, x, y, text){
	let color = new cv.Scalar(255, 255, 255);
	var font = cv.FONT_HERSHEY_SIMPLEX 
	let center = new cv.Point( Math.ceil( x ), Math.ceil( y ) );
	cv.putText(image, text, center, font, 0.6, color, 1.2, cv.LINE_AA)
}

draw.drawLine = function(x1, y1, x2, y2, color){
	drawCanvasCtx.strokeStyle = `rgb(
        ${Math.floor(color[0])},
        ${Math.floor(color[1])},
        ${Math.floor(color[2])})`;

    var ctx_x1 = x1 / vidWidth * drawCanvas.width
    var ctx_y1 = y1 / vidHeight * drawCanvas.height

    var ctx_x2 = x2 / vidWidth * drawCanvas.width
    var ctx_y2 = y2 / vidHeight * drawCanvas.height

    drawCanvasCtx.beginPath()
    drawCanvasCtx.moveTo(ctx_x1, ctx_y1);
    drawCanvasCtx.lineTo(ctx_x2, ctx_y2);
    drawCanvasCtx.lineWidth = 5;

    drawCanvasCtx.stroke();
}

draw.drawKps = function(kps, offsetX, offsetY){
	// console.log("kps.size()", kps.size(), offsetX, offsetY)
	for (let i = 0; i < kps.size(); i++){
		let x = offsetX + Math.ceil( kps.get(i).pt.x )
		let y = offsetY + Math.ceil( kps.get(i).pt.y )
		draw.drawPointInCtx(x, y, 8, [0, 100, 100]) 
	}
}

draw.drawBounds = function(bounds){

	drawCanvasCtx.strokeStyle = `rgb(
        ${Math.floor(0)},
        ${Math.floor(0)},
        ${Math.floor(0)})`;

	var ctx_x1 = bounds.minX / vidWidth * drawCanvas.width
    var ctx_y1 = bounds.minY  / vidHeight * drawCanvas.height

    var ctx_x2 = bounds.maxX  / vidWidth * drawCanvas.width
    var ctx_y2 = bounds.minY  / vidHeight * drawCanvas.height

    var ctx_x3 = bounds.maxX  / vidWidth * drawCanvas.width
    var ctx_y3 = bounds.maxY  / vidHeight * drawCanvas.height

    var ctx_x4 = bounds.minX  / vidWidth * drawCanvas.width
    var ctx_y4 = bounds.maxY  / vidHeight * drawCanvas.height

    drawCanvasCtx.beginPath()
    drawCanvasCtx.moveTo(ctx_x1, ctx_y1);
    drawCanvasCtx.lineTo(ctx_x2, ctx_y2);
    drawCanvasCtx.lineTo(ctx_x3, ctx_y3);
    drawCanvasCtx.lineTo(ctx_x4, ctx_y4);
    drawCanvasCtx.lineTo(ctx_x1, ctx_y1);
    drawCanvasCtx.lineWidth = 4;

    drawCanvasCtx.stroke();
}

