var gl;
var canvas;

// Frame counter
var frame = 0;

// Shader programs
var program;
var shadowProgram;

// Render to texture
var fb; // frame buffer
var rb; // render buffer
var texture_rtt; // rendered texture

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
var lightDir = [0.58, 0.58, -0.58];
var lightMatrix = lookAt([0.0, 0.0, 0.0], lightDir, [0.0, 1.0, 0.0]);
var PMatrixLight; // light projection matrix
var LMatrixLight; // light lookat matrix
var lightDirection; // light direction

// Shadow
var shadowMatrix;
var PmatrixShadow; // shadow projection matrix (ortho)
var LmatrixShadow; // light lookat matrix
var MmatrixShadow; // shadow model matrix

// Attributes
var aPosition;
var aVertexColor;
var aTextureCoord;
var aNormal;
var aPositionShadow;

// Uniforms
var modelPtr; // model
var viewPtr; // view
var projectionPtr; // projection
var normalMatPtr; // normal
var uSampler; // texture sampler
var samplerShadowMap; // shadow map sampler

// Booleans
var autoRotate = true;
var autoMove = true;
var showAxis = true;
var showGrid = false;
var showSkybox = false;

window.onload = function init(){
	canvas = document.getElementById("gl-canvas");

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
	shadowMatrix = ortho(-12, 12, -12, 12, -12, 12);

	// for shadowProgram
	shadowProgram = initShaders(gl, "vertex-shadowmap", "fragment-shadowmap");
	PmatrixShadow = gl.getUniformLocation(shadowProgram, "Pmatrix"); // shadow projection matrix
	LmatrixShadow = gl.getUniformLocation(shadowProgram, "Lmatrix"); // shadow location matrix
	MmatrixShadow = gl.getUniformLocation(shadowProgram, "Mmatrix");
	aPositionShadow = gl.getAttribLocation(shadowProgram, "position"); // Shadow position attribute pointer
	gl.useProgram(shadowProgram);
	gl.uniform3fv(lightDirection, lightDir);

	//Load shaders and initialize attribute buffers
	program = initShaders(gl, "vertex-shader", "fragment-shader");

	// for program
	modelPtr = gl.getUniformLocation(program, "model"); // model
	viewPtr = gl.getUniformLocation(program, "view"); // view
	projectionPtr = gl.getUniformLocation(program, "projection"); // projection
	normalMatPtr = gl.getUniformLocation(program, "normalMat"); // normal
	PMatrixLight = gl.getUniformLocation(program, "PmatrixLight"); // light projection matrix
	LMatrixLight = gl.getUniformLocation(program, "Lmatrix"); // light location matrix
	lightDirection = gl.getUniformLocation(program, "source_direction"); // light direction
	aPosition = gl.getAttribLocation(program, "aPosition"); // Position attribute pointer
	aVertexColor = gl.getAttribLocation(program, "aVertexColor"); // Color attribute pointer
	aNormal = gl.getAttribLocation(program, "aNormal"); // Normal attribute pointer
	aTextureCoord = gl.getAttribLocation(program, "aTextureCoord"); // Texture attribute pointer

	gl.useProgram(program);
	gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0); // texture sampler
	gl.uniform1i(gl.getUniformLocation(program, "samplerShadowMap"), 1); // shadowmap sampler
	// assign projection matrix
	gl.uniformMatrix4fv(projectionPtr, 0, flatten(projectionMatrix));
	// set initial camera up
	updateCamera();

	for(var i = 0; i < models.length; i++) {
		models[i].bufferData();
	}

	// create external frame buffer and render to texture stuff
	fb = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
	rb = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16 , 512, 512);

  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
                             gl.RENDERBUFFER, rb);

  var texture_rtt = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture_rtt);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512,
                0, gl.RGBA, gl.UNSIGNED_BYTE, null);

  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
                          gl.TEXTURE_2D, texture_rtt, 0);

  gl.bindTexture(gl.TEXTURE_2D, null); // unbind stuff
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

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

	// bind the shadowmap
	gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture_rtt);

	// start render loop
	draw();
	setInterval(draw, 17); // 17 milliseconds is a little less than 60fps
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

function draw() {
	frame++;
	renderShadowmap();
	render();
}

// render everything
function render() {
	gl.useProgram(program);
	gl.enableVertexAttribArray(aPosition);
	gl.enableVertexAttribArray(aVertexColor);
	gl.enableVertexAttribArray(aNormal);
	gl.enableVertexAttribArray(aTextureCoord);

	gl.clearColor(0.1, 0.1, 0.1, 1.0);
	gl.viewport(0, 0, canvas.width, canvas.height);

	// clear
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	rotateModels();
	moveModels();
	updateCamera();

	gl.uniformMatrix4fv(PMatrixLight, false, flatten(shadowMatrix));
	gl.uniformMatrix4fv(LMatrixLight, false, flatten(lightMatrix));

	for(var i = 0; i < models.length; i++) {
		var modelMatrix = models[i].getMatrix();
		gl.uniformMatrix4fv(modelPtr, 0, flatten(modelMatrix)); // assign new model matrix
		gl.uniformMatrix4fv(normalMatPtr, 0, flatten(transpose(inverse(mult(viewMatrix, modelMatrix)))));

			if (i == 0) {
				if (showAxis)
					models[i].drawModel(true);
			} else {
				models[i].drawModel(false);
			}
	}

	gl.disableVertexAttribArray(aPosition);
	gl.disableVertexAttribArray(aVertexColor);
	gl.disableVertexAttribArray(aNormal);
	gl.disableVertexAttribArray(aTextureCoord);

	gl.flush();
}

function renderShadowmap() {
	// render shadowmap
	gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
	gl.useProgram(shadowProgram);
  gl.enableVertexAttribArray(aPositionShadow);

  gl.viewport(0.0, 0.0, 512, 512);
  gl.clearColor(1.0, 0.0, 0.0, 1.0); // red -> Z=Zfar on the shadow map
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.uniformMatrix4fv(PmatrixShadow, false, flatten(shadowMatrix));
  gl.uniformMatrix4fv(LmatrixShadow, false, flatten(lightMatrix));

	// render
	for(var i = 1; i < models.length; i++) {
		gl.uniformMatrix4fv(MmatrixShadow, false, flatten(models[i].getMatrix()));

		models[i].drawShadows();
	}

	gl.disableVertexAttribArray(aPositionShadow);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}
