function Model(vertices) {
	this.vertices = vertices;
	this.colors = null;
	this.xRot = 0;
	this.yRot = 0;
	this.zRot = 0;
	this.xPos = 0;
	this.yPos = 0;
	this.zPos = 0;
	this.vertexBuffId = null;
	this.colorBuffId = null;
}

Model.prototype.bufferData = function() {
	// Buffer vertex data
	this.vertexBuffId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffId);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW);

	// Buffer color data if it exists
	if (this.colors != null) {
		this.colorBuffId = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffId);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(this.colors), gl.STATIC_DRAW);
	}
}

Model.prototype.getMatrix = function() {
	return mult(translate(this.xPos, this.yPos, this.zPos), mult(mult(rotate(this.xRot, vec3(1, 0, 0)), rotate(this.yRot, vec3(0, 1, 0))), rotate(this.zRot, vec3(0, 0, 1))));
}

Model.prototype.drawModel = function() {
	// rebind model vertices and color
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffId);
	gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffId);
	gl.vertexAttribPointer(vVertexColor, 4, gl.FLOAT, false, 0, 0);

	// draw
	gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);
}

var pyramid = new Model([
	-1.0, -1.0, 1.0,
	0.0, 1.0, 0.0,
	1.0, -1.0, 1.0,
	1.0, -1.0, 1.0,
	0.0, 1.0, 0.0,
	1.0, -1.0, -1.0,
	1.0, -1.0, -1.0,
	0.0, 1.0, 0.0,
	-1.0, -1.0, -1.0,
	-1.0, -1.0, -1.0,
	0.0, 1.0, 0.0,
	-1.0, -1.0, 1.0,
	-1.0, -1.0, 1.0,
	-1.0, -1.0, -1.0,
	1.0, -1.0, -1.0,
	1.0, -1.0, -1.0,
	1.0, -1.0, 1.0,
	-1.0, -1.0, 1.0
]);
pyramid.colors = [
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	1.0, 0.0, 0.0, 1.0
];
pyramid.zPos = -10.0;
pyramid.xPos = -5.0;
pyramid.yPos = 2.0;

var d20 = new Model([
	1.045361, 0.017499, -0.468442,
	0.194711, 0.543230, -0.793362,
	0.720442, 0.868150, 0.057289
]);
d20.colors = [
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0
];
d20.zPos = -10.0;
d20.xPos = 5.0;
d20.yPos = 2.0;

var phone_case = new Model([
	4.0, -2.0, -5.0,	//A's first vertex
	3.5, -2.0, -5.0,	//A's second vertex
	3.5, 2.0, -5.0,		//A's third vertex
	4.0, -2.0, -5.0,	//B's first vertex
	4.0, 2.0, -5.0,		//B's second vertex
	3.5, 2.0, -5.0,		//B's third vertex
	4.0, -2.0, -5.0,	//C's first vertex
	4.0, -2.0, 5.0,		//C's second vertex
	3.5, -2.0, -5.0,	//C's third vertex
	3.5, -2.0, -5.0,	//D's first vertex
	3.5, -2.0, 5.0,		//D's second vertex
	4.0, -2.0, 5.0,		//D's third vertex
	4.0, 2.0, -5.0,		//E's first vertex
	4.0, 2.0, 5.0,		//E's second vertex
	3.5, 2.0, 5.0,		//E's third vertex
	4.0, 2.0, -5.0,		//F's first vertex
	3.5, 2.0, -5.0,		//F's second vertex
	3.5, 2.0, 5.0,		//F's third vertex
	4.0, 2.0, 5.0,		//G's first vertex
	3.5, 2.0, 5.0,		//G's second vertex
	4.0, -2.0, 5.0,		//G's third vertex
	4.0, -2.0, 5.0,		//H's first vertex
	3.5, -2.0, 5.0,		//H's second vertex
	3.5, 2.0, 5.0,		//H's third vertex
	3.5, -2.0, -5.0,	//I's first vertex
	3.5, -2.0, 5.0,		//I's second vertex
	3.5, 2.0, 5.0,		//I's third vertex
	3.5, -2.0, -5.0,	//J's first vertex
	3.5, 2.0, -5.0,		//J's second vertex
	3.5, 2.0, 5.0,		//J's third vertex

	//delete front face to make case
	/*4.0, -2.0, -5.0,	//K's first vertex
	4.0, 2.0, -5.0,		//K's second vertex
	4.0, 2.0, 5.0,		//K's third vertex
	4.0, -2.0, -5.0,	//L's first vertex
	4.0, -2.0, 5.0,		//L's second vertex
	4.0, 2.0, 5.0			//L's third vertex*/
]);

  phone_case.colors = [
    0.0, 1.0, 1.0, 1.0, //Red and Alpha
  	0.0, 1.0, 1.0, 1.0, //Green and Alpha
  	0.0, 1.0, 1.0, 1.0, //Blue and Alpha
  	0.0, 1.0, 1.0, 1.0, //Blue and Alpha
  	0.0, 1.0, 1.0, 1.0, //Green and Alpha
  	0.0, 1.0, 1.0, 1.0, //Red and Alpha
  	0.0, 0.0, 1.0, 1.0, //Red and Alpha
  	0.0, 0.0, 1.0, 1.0, //Green and Alpha
  	0.0, 0.0, 1.0, 1.0, //Blue and Alpha
  	0.0, 0.0, 1.0, 1.0, //Blue and Alpha
  	0.0, 0.0, 1.0, 1.0, //Green and Alpha
  	0.0, 0.0, 1.0, 1.0, //Red and Alpha
  	0.0, 0.0, 1.0, 1.0, //Red and Alpha
  	0.0, 0.0, 1.0, 1.0, //Blue and Alpha
  	0.0, 0.0, 1.0, 1.0, //Red and Alpha
  	0.0, 0.0, 1.0, 1.0, //Red and Alpha
  	0.0, 0.0, 1.0, 1.0, //Blue and Alpha
  	0.0, 0.0, 1.0, 1.0, //Red and Alpha
    //
    0.0, 1.0, 1.0, 1.0, //Red and Alpha
  	0.0, 1.0, 1.0, 1.0, //Green and Alpha
  	0.0, 1.0, 1.0, 1.0, //Blue and Alpha
  	0.0, 1.0, 1.0, 1.0, //Blue and Alpha
  	0.0, 1.0, 1.0, 1.0, //Green and Alpha
  	0.0, 1.0, 1.0, 1.0, //Red and Alpha
  	0.0, 1.0, 0.0, 1.0, //Red and Alpha
  	1.0, 1.0, 0.0, 1.0, //Green and Alpha
  	0.0, 1.0, 0.0, 1.0, //Blue and Alpha
  	0.0, 1.0, 0.0, 1.0, //Blue and Alpha
  	1.0, 1.0, 0.0, 1.0, //Green and Alpha
  	0.0, 1.0, 0.0, 1.0, //Red and Alpha
  	0.0, 1.0, 0.0, 1.0, //Red and Alpha
  	0.0, 1.0, 0.0, 1.0, //Blue and Alpha
  	0.0, 1.0, 0.0, 1.0, //Red and Alpha
  	0.0, 1.0, 0.0, 1.0, //Red and Alpha
  	0.0, 1.0, 0.0, 1.0, //Blue and Alpha
  	0.0, 1.0, 0.0, 1.0  //Red and Alpha
];

phone_case.zPos = -20.0;
phone_case.xPos = 2.0;
phone_case.yPos = 0.0;

var models = [pyramid, d20, phone_case];
