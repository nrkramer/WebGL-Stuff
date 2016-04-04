var gl;

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
var cameraPosZ = 11.35;

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
	gl.clearColor(0.8, 0.8, 0.8, 1.0);
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
	// Texture attribute pointer
	aTextureCoord = gl.getAttribLocation(program, "aTextureCoord");
	gl.enableVertexAttribArray(aTextureCoord);
	gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);
	// Normal attribute pointer
	aNormal = gl.getAttribLocation(program, "aNormal");

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
		if(event.keyCode == 87)
		{
			cameraPosZA = -1.0;
		} else if (event.keyCode == 83) { // for 's'
			cameraPosZA = 1.0;
		} else if (event.keyCode == 65) { // for 'a'
			cameraPosXA = -1.0;
		} else if (event.keyCode == 68) { // for 'd'
			cameraPosXA = 1.0;
		} else {
		}
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
		} else {
		}
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
			cameraRotX -= changes.x / 150.0;
			cameraRotY += changes.y / 150.0;
		}
	});

	// various controls
	$("#rotateCheck").change(function() {
		autoRotate = $(this).is(':checked');
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
	if (cameraPosZS < cameraPosZA)
		cameraPosZS += 0.01;
	if (cameraPosZS > cameraPosZA)
		cameraPosZS -= 0.01;
	if ((cameraPosZS > -0.01) && (cameraPosZS < 0.01)) // clamp values
		cameraPosZS = 0.0;
	if ((cameraPosXS > -0.01) && (cameraPosXS < 0.01))
		cameraPosXS = 0.0;

	cameraPosX += cameraPosXS; // add speed to position
	cameraPosZ += cameraPosZS; // add speed to position
	var xRot = vec3(1.0 * Math.cos(cameraRotX), 0.0, -1.0 * Math.sin(cameraRotX));
	var yRot = vec3(0.0, 1.0 * Math.sin(cameraRotY), 1.0 * Math.cos(cameraRotY));
	var eye = vec3(cameraPosX, cameraPosY, cameraPosZ);
	var at = add(add(yRot, xRot), eye);
	viewMatrix = lookAt(eye, at, vec3(0.0, 1.0, 0.0));
	gl.uniformMatrix4fv(viewPtr, 0, flatten(viewMatrix));
	// update HTML
	$("#positionText").html("Position: (" + cameraPosX.toFixed(2) + ", " + cameraPosY.toFixed(2) + ", " + cameraPosZ.toFixed(2) + ")");
	$("#rotationText").html("Rotation: (" + Math.sin(cameraRotX).toFixed(2) + ", " + cameraRotY.toFixed(2) + ", " + cameraRotZ.toFixed(2) + ")");
}

// rotate models
function rotateModels() {
	if (autoRotate) {
		for(var i = 1; i < models.length; i++) {
			if (models[i].autoRotate) {
				models[i].xRot += 1.0;
				models[i].yRot += 1.0;
			}
		}
	}
}

// render everything
function render() {
	// clear
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	updateCamera();
	rotateModels();

	// render axis
	if (showAxis) {
		gl.uniformMatrix4fv(modelPtr, 0, flatten(models[0].getMatrix())); // assign new model matrix
		models[0].drawModel(true);
	}

	for(var i = 1; i < models.length; i++) {
		var modelMatrix = models[i].getMatrix();
		gl.uniformMatrix4fv(modelPtr, 0, flatten(modelMatrix)); // assign new model matrix
		gl.uniformMatrix4fv(normalMatPtr, 0, flatten(transpose(inverse(mult(modelMatrix, viewMatrix))))); // get normal matrix
		models[i].drawModel(false);
	}
}
