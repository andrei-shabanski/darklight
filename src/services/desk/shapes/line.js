import { SimpleShape } from './base';

export default class Line extends SimpleShape {
  draw(scale) {
    super.draw(scale);

    this.canvasCtx.lineCap = 'round';
    this.canvasCtx.strokeStyle = this.options.color;
    this.canvasCtx.lineWidth = this.options.size;

    this.canvasCtx.beginPath();
    this.canvasCtx.moveTo(this.startPoint.x, this.startPoint.y);
    this.canvasCtx.lineTo(this.endPoint.x, this.endPoint.y);
    this.canvasCtx.stroke();
  }
}
