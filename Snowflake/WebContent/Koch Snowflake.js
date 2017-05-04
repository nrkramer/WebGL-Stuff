//BY: NOLAN KRAMER, ERIC ROBLES, RILEY BOUCOT
//COSC 338 - COMPUTER GRAPHICS

var gl;
var points;
var vertices = [
                vec2 (-0.7, 0.7 ),
                vec2 (0.7, 0.7),
                vec2 (0.0, 0.7 - 1.212435)];
var translate = null;
var bufferID = null;

function createTriangle(i, nextVertexIndex) { 
	// p1 & p2 are points (vectors from the origin)
	var p1 = vertices[i];
	var p2 = vertices[nextVertexIndex];

	// Displacement vector
	var v1 = subtract(p2, p1);

	var magnitude = Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2));
	var distance = vec2(magnitude/3.0, magnitude/3.0);

	var direction = normalize(v1, false);

	// Create the first point of our new triangle
	var np1 = add(p1, mult(direction, distance));
	// Create the second point of our new triangle
	var np2 = vec2(0.0, 0.0);

	var distance2 = vec2(magnitude/2.0, magnitude/2.0);

	// Displacement vector
	var midPoint = add(p1, mult(direction, distance2));

	var directionPerp = vec2(0.0, 0.0);
	var tmp = vec3(v1[0], v1[1], -1.0);
	directionPerp = vec2(cross(vec3(v1), tmp));
	directionPerp = normalize(directionPerp, false);

	// pythagoras
	var c = (distance[0] * distance[0]);
	var b = (distance[0]/2.0 * distance[0]/2.0);
	var h = Math.sqrt(c - b);

	var distance3 = vec2(h, h);

	np2 = add(midPoint, mult(directionPerp, distance3));

	// Create the third point of our new triangle
	var np3 = subtract(p2, mult(direction, distance));

	return [np1, np2, np3];
}

function Koch(vertices, iterations)
{
	var progress_bar = document.getElementById("progress");
	var total_prog = document.getElementById("total");
	for(var j = 0; j < iterations; j++) {
		for(var i = 0; i < vertices.length; i++)
		{
			var nextIndex = i+1;
			if (nextIndex == vertices.length)
				nextIndex = 0;
			var newEdges = createTriangle(i, nextIndex);
			vertices.splice(i + 1, 0, vec2(newEdges[0]), vec2(newEdges[1]), vec2(newEdges[2]));
			i += 3;
		}
	}
}

window.onload = function init(){
	var canvas = document.getElementById("gl-canvas");

	gl = WebGLUtils.setupWebGL( canvas );
	if (!gl) { alert("WebGL isn't available");} else {
		$("#slider").slider({
			min: 0,
			max: 5,
			step: 1,
			change: function(event, ui) {
				$("#iterations_value").html(ui.value);
				vertices = [
			                vec2 (-0.7, 0.7 ),
			                vec2 (0.7, 0.7),
			                vec2 (0.0, 0.7 - 1.212435)];
				Koch(vertices, ui.value);
				gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
				render();
			}
		});
	}

	Koch(vertices, 0);

	// Configure WebGL
	gl.viewport( 0, 0, canvas.width, canvas.height);
	gl.clearColor (0.0, 0.0, 0.0, 4.0);

	//Load shaders and initialize attribute buffers
	var program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);

	//Load the data into the GPU
	var bufferID = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferID);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

	//Associate our shader variables with our data buffer
	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);

	//Get uniform translation location
	var translate = gl.getUniformLocation(program, "vTranslate");
	gl.uniform4f(translate, 0.0, -0.25, 0.0, 0.0);

	render();
};

function render(){
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.LINE_LOOP, 0, vertices.length);
}
