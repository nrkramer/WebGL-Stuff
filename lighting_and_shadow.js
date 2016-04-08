var gl;

// Frame counter
var frame = 0;

// Camera
var viewMatrix;
var cameraRotX = 0.96;
var cameraRotY = 9.72;
var cameraRotZ = 0.0;
var cameraPosXS = 0.0;
var cameraPosYS = 0.0;
var cameraPosZS = 0.0;
var cameraPosXA = 0.0;
var cameraPosYA = 0.0;
var cameraPosZA = 0.0;
var cameraPosX = 5.15;
var cameraPosY = 1.0;
var cameraPosZ = -11.35;

// Light
var lightPosPtr;

// Attributes
var aPosition;
var aVertexColor;
var aTextureCoord;
var aNormal;

// Uniforms
var modelPtr;
var viewPtr;
var projectionPtr;
var normalMatPtr;
var uSampler;

// Booleans
var autoRotate = true;
var autoMove = true;
var showAxis = true;
var showGrid = false;
var showSkybox = false;

window.onload = function init(){
	var canvas = document.getElementById("gl-canvas");

	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) { alert("WebGL isn't available"); }

	// Configure WebGL
	canvas.width = $(window).width();
	canvas.height = $(window).height();
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.1, 0.1, 0.1, 1.0);
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	// Create perspective matrix
	var aspect = canvas.width / canvas.height;
	var projectionMatrix = perspective(45, aspect, 0.1, 100);

	//Load shaders and initialize attribute buffers
	var program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);

	// Get model and projection matrix registers
	modelPtr = gl.getUniformLocation(program, "model");
	viewPtr = gl.getUniformLocation(program, "view");
	projectionPtr = gl.getUniformLocation(program, "projection");
	normalMatPtr = gl.getUniformLocation(program, "normalMatrix");

	// Light position pointer
	lightPosPtr = gl.getUniformLocation(program, "lightPos");

	// assign projection matrix
	gl.uniformMatrix4fv(projectionPtr, 0, flatten(projectionMatrix));
	// set initial camera up
	updateCamera();

	// Position attribute pointer
	aPosition = gl.getAttribLocation(program, "aPosition");
	gl.enableVertexAttribArray(aPosition);
	// Color attribute pointer
	aVertexColor = gl.getAttribLocation(program, "aVertexColor");
	gl.enableVertexAttribArray(aVertexColor);
	// Normal attribute pointer
	aNormal = gl.getAttribLocation(program, "aNormal");
	gl.enableVertexAttribArray(aNormal);
	// Texture attribute pointer
	aTextureCoord = gl.getAttribLocation(program, "aTextureCoord");
	gl.enableVertexAttribArray(aTextureCoord);
	gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);

	for(var i = 0; i < models.length; i++) {
		models[i].bufferData();
	}

	// camera movement
	canvas.addEventListener('mousedown', function(event) {
		if (event.buttons == 1) {
			canvas.style.cursor = "none";
		}
	});
	document.addEventListener('keydown', function(event) {
		// for 'w'
		if(event.keyCode == 87) { // for 'w'
			cameraPosZA = 1.0;
		} else if (event.keyCode == 83) { // for 's'
			cameraPosZA = -1.0;
		} else if (event.keyCode == 65) { // for 'a'
			cameraPosXA = 1.0;
		} else if (event.keyCode == 68) { // for 'd'
			cameraPosXA = -1.0;
		} else if (event.keyCode == 81) { // for 'q'
			cameraPosYA = 1.0;
		} else if (event.keyCode == 69) { // for 'e'
			cameraPosYA = -1.0;
		} else {}
	});
	document.addEventListener('keyup', function(event) {
		if(event.keyCode == 87)
		{
			cameraPosZA = 0.0;
		} else if (event.keyCode == 83) { // for 's'
			cameraPosZA = 0.0;
		} else if (event.keyCode == 65) { // for 'a'
			cameraPosXA = 0.0;
		} else if (event.keyCode == 68) { // for 'd'
			cameraPosXA = 0.0;
		} else if (event.keyCode == 81) { // for 'q'
			cameraPosYA = 0.0;
		} else if (event.keyCode == 69) { // for 'e'
			cameraPosYA = 0.0;
		} else {}
	});
	canvas.addEventListener('mouseup', function(event) {
		canvas.style.cursor = "default";
	});
	canvas.addEventListener('mousemove', function(event) {
		var canvasRect = canvas.getBoundingClientRect();
		var changes = {
			x: event.movementX,
			y: event.movementY
		};
		var mousePos = {
			x: event.clientX - canvasRect.left,
			y: event.clientY - canvasRect.top
		};
		if (event.buttons == 1) { // holding left down
			// update camera
			cameraRotY += changes.x / 5.0;
			cameraRotX += changes.y / 5.0;
		}
	});

	// various controls
	$("#rotateCheck").change(function() {
		autoRotate = $(this).is(':checked');
	});
	$("#movementCheck").change(function() {
		autoMove = $(this).is(':checked');
	});
	$("#axisCheck").change(function() {
		showAxis = $(this).is(':checked');
	});

	// start render loop
	render();
	setInterval(render, 17); // 17 milliseconds is a little less than 60fps
};

// update camera
function updateCamera() {
	// accelerate camera
	if (cameraPosXS < cameraPosXA)
		cameraPosXS += 0.01;
	if (cameraPosXS > cameraPosXA)
		cameraPosXS -= 0.01;
	if (cameraPosYS < cameraPosYA)
		cameraPosYS += 0.01;
	if (cameraPosYS > cameraPosYA)
		cameraPosYS -= 0.01;
	if (cameraPosZS < cameraPosZA)
		cameraPosZS += 0.01;
	if (cameraPosZS > cameraPosZA)
		cameraPosZS -= 0.01;
	if ((cameraPosXS > -0.01) && (cameraPosXS < 0.01))
		cameraPosXS = 0.0;
	if ((cameraPosYS > -0.01) && (cameraPosYS < 0.01))
		cameraPosYS = 0.0;
	if ((cameraPosZS > -0.01) && (cameraPosZS < 0.01)) // clamp values
		cameraPosZS = 0.0;

	cameraPosX += cameraPosXS; // add speed to X position
	cameraPosY += cameraPosYS; // add speed to Y position
	cameraPosZ += cameraPosZS; // add speed to Z position
	var xRot = vec3(1.0 * Math.cos(cameraRotX), 0.0, -1.0 * Math.sin(cameraRotX));
	var yRot = vec3(0.0, 1.0 * Math.sin(cameraRotY), 1.0 * Math.cos(cameraRotY));
	var eye = vec3(cameraPosX, cameraPosY, cameraPosZ);
	var at = add(add(xRot, yRot), eye);
	var rotationMat = mult(rotate(cameraRotX, vec3(1.0, 0.0, 0.0)), rotate(cameraRotY, vec3(0.0, 1.0, 0.0)));
	viewMatrix = mult(mult(rotationMat, translate(cameraPosX, cameraPosY, cameraPosZ)), lookAt(vec3(0.0, 0.0, 0.0), vec3(0.0, 0.0, 1.0), vec3(0.0, 1.0, 0.0)));
	gl.uniformMatrix4fv(viewPtr, 0, flatten(viewMatrix));
	// update HTML
	$("#positionText").html("Position: (" + cameraPosX.toFixed(2) + ", " + cameraPosY.toFixed(2) + ", " + cameraPosZ.toFixed(2) + ")");
	$("#rotationText").html("Rotation: (" + Math.sin(cameraRotX).toFixed(2) + ", " + cameraRotY.toFixed(2) + ", " + cameraRotZ.toFixed(2) + ")");
}

// auto-move models
function moveModels() {
	if (autoMove) {
		for(var i = models.length - 1; i < models.length; i++) {
			if (models[i].showcase) {
				models[i].xPos = 10.0 * Math.cos(frame / 60.0);
				models[i].zPos = 10.0 * Math.sin(frame / 60.0);
				gl.uniform3f(lightPosPtr, models[i].xPos, models[i].yPos, models[i].zPos);
			}
		}
	}
}

// auto-rotate models
function rotateModels() {
	if (autoRotate) {
		for(var i = 1; i < models.length; i++) {
			if (models[i].showcase) {
				models[i].xRot += 1.0;
				models[i].yRot += 1.0;
			}
		}
	}
}

// render everything
function render() {
	frame++;
	// clear
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	updateCamera();
	rotateModels();
	moveModels();

	for(var i = 0; i < models.length; i++) {
		var modelMatrix = models[i].getMatrix();
		gl.uniformMatrix4fv(modelPtr, 0, flatten(modelMatrix)); // assign new model matrix
		gl.uniformMatrix4fv(normalMatPtr, 0, flatten(transpose(inverse(mult(viewMatrix, modelMatrix))))); // get normal matrix
		if (i == 0)
			models[i].drawModel(true);
		else {
			models[i].drawModel(false);
		}
	}
}
