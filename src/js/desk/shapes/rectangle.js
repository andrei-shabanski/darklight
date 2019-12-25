import { SimpleShape } from "./base";

export default class Rectangle extends SimpleShape {

  draw(scale) {
    super.draw(scale);

    this.canvasCtx.strokeStyle = this.options.color;
    this.canvasCtx.lineJoin = 'round';
    this.canvasCtx.lineWidth = this.options.size;

    this.canvasCtx.strokeRect(
      this.startPoint.x,
      this.startPoint.y,
      this.endPoint.x - this.startPoint.x,
      this.endPoint.y - this.startPoint.y
    );
  }

}
