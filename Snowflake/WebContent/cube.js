var gl;
var points;

window.onload = function init(){
	var canvas = document.getElementById("gl-canvas");

	gl = WebGLUtils.setupWebGL( canvas );
	if (!gl) { alert("WebGL isn't available");}

	// Four Vertices
	var vertices = [
		// Front face
		-1.0, -1.0,  1.0,
		1.0, -1.0,  1.0,
		1.0,  1.0,  1.0,
		-1.0,  1.0,  1.0,

		// Back face
		-1.0, -1.0, -1.0,
		-1.0,  1.0, -1.0,
		1.0,  1.0, -1.0,
		1.0, -1.0, -1.0,

		// Top face
		-1.0,  1.0, -1.0,
		-1.0,  1.0,  1.0,
		1.0,  1.0,  1.0,
		1.0,  1.0, -1.0,

		// Bottom face
		-1.0, -1.0, -1.0,
		1.0, -1.0, -1.0,
		1.0, -1.0,  1.0,
		-1.0, -1.0,  1.0,

		// Right face
		1.0, -1.0, -1.0,
		1.0,  1.0, -1.0,
		1.0,  1.0,  1.0,
		1.0, -1.0,  1.0,

		// Left face
		-1.0, -1.0, -1.0,
		-1.0, -1.0,  1.0,
		-1.0,  1.0,  1.0,
		-1.0,  1.0, -1.0
	];

	var colors = [
	  [1.0,  1.0,  1.0,  1.0],    // Front face: white
	  [1.0,  0.0,  0.0,  1.0],    // Back face: red
	  [0.0,  1.0,  0.0,  1.0],    // Top face: green
	  [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
	  [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
	  [1.0,  0.0,  1.0,  1.0]     // Left face: purple
	];

	// Configure WebGL
	gl.viewport( 0, 0, canvas.width, canvas.height);
	gl.clearColor (0.0, 0.0, 0.0, 1.0);

	//Load shaders and initialize attribute buffers
	var program = initShaders( gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);

	//Load the data into the GPU
	var bufferID = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferID);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

	//Associate our shader variables with our data buffer
	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);

	render();
};

function render(){
	gl.clear( gl.COLOR_BUFFER_BIT);
	gl.drawArrays( gl.TRIANGLE_FAN, 0, 4);
}
