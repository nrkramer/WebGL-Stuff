function Light(position, hasModel) {
  this.position = position;
  this.model = null;
  if (hasModel) {
    this.model = MakeSphere(30, 30, 0.5);
    this.model.xPos = position[0];
    this.model.yPos = position[1];
    this.model.zPos = position[2];
  }
}

Light.prototype.setPosition(position) {
  this.position = postion;
  if (this.model != null) {
    this.model.xPos = position[0];
    this.model.yPos = position[1];
    this.model.zPos = position[2];
  }
}
