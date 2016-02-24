var gl;

// Camera
var viewMatrix;
var cameraRotX = 0.0;
var cameraRotY = 9.43;
var cameraRotZ = 0.0;

// Attributes
var vPosition;
var vVertexColor;

// Uniforms
var modelPtr;
var viewPtr;
var projectionPtr;

// Booleans
var autoRotate = true;

window.onload = function init(){
	var canvas = document.getElementById("gl-canvas");

	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) { alert("WebGL isn't available");}

	// Configure WebGL
	canvas.width = $(window).width();
	canvas.height = $(window).height();
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	// Create perspective matrix
	var aspect = canvas.width / canvas.height;
	viewMatrix = lookAt(vec3(0.0, 0.0, 0.0), vec3(0.0, 0.0, -1.0), vec3(0.0, 1.0, 0.0));
	var projectionMatrix = perspective(45, aspect, 0.1, 100);

	//Load shaders and initialize attribute buffers
	var program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);

	// Get model and projection matrix registers
	modelPtr = gl.getUniformLocation(program, "model");
	viewPtr = gl.getUniformLocation(program, "view");
	projectionPtr = gl.getUniformLocation(program, "projection");

	// assign projection matrix
	gl.uniformMatrix4fv(projectionPtr, 0, flatten(projectionMatrix));
	// set initial camera up
	gl.uniformMatrix4fv(viewPtr, 0, flatten(viewMatrix));

	// Position attribute pointer
	vPosition = gl.getAttribLocation(program, "vPosition");
	gl.enableVertexAttribArray(vPosition);
	// Color attribute pointer
	vVertexColor = gl.getAttribLocation(program, "vVertexColor");
	gl.enableVertexAttribArray(vVertexColor);

	for(var i = 0; i < models.length; i++) {
		models[i].bufferData();
	}

	// camera movement
	canvas.addEventListener('mousedown', function(event) {
		if (event.buttons == 1) {
			canvas.style.cursor = "none";
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
			var xRot = vec3(-1.0 * Math.sin(cameraRotX), 0.0, -1.0 * Math.cos(cameraRotX));
			var yRot = vec3(0.0, 1.0 * Math.sin(cameraRotY), 1.0 * Math.cos(cameraRotY));
			var at = add(yRot, xRot);
			viewMatrix = lookAt(vec3(0.0, 0.0, 0.0), at, vec3(0.0, 1.0, 0.0));
			gl.uniformMatrix4fv(viewPtr, 0, flatten(viewMatrix));
		}
	});

	// various controls
	$("#rotateCheck").change(function() {
		autoRotate = $(this).is(':checked');
	});

	// start render loop
	render();
	setInterval(render, 17); // 17 milliseconds is a little less than 60fps
};

// rotate models
function rotateModels() {
	if (autoRotate) {
		for(var i = 0; i < models.length; i++) {
			models[i].xRot += 1.0;
			models[i].yRot += 1.0;
		}
	}
}

// render everything
function render() {
	rotateModels();

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	for(var i = 0; i < models.length; i++) {
		gl.uniformMatrix4fv(modelPtr, 0, flatten(models[i].getMatrix())); // assign new model matrix
		models[i].drawModel();
	}
}
