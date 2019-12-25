import { SimpleShape } from "./base";
import Point from "../point";

export default class Pen extends SimpleShape {
  constructor(canvasContext, point, options, commitCallback) {
    super(canvasContext, point, options, commitCallback);

    this.points = [point];
  }

  onCanvasMouseMove(event) {
    super.onCanvasMouseMove(event);

    const points = this.points.slice();
    points.push(Point.fromEvent(event, this.options));

    this.update({points: points});
  }

  draw(scale) {
    super.draw(scale);

    this.canvasCtx.lineCap = 'round';
    this.canvasCtx.lineJoin = 'round';
    this.canvasCtx.strokeStyle = this.options.color;
    this.canvasCtx.lineWidth = this.options.size;

    this.canvasCtx.beginPath();
    this.canvasCtx.moveTo(this.startPoint.x, this.startPoint.y);
    this.points.forEach(function (point) {
      this.canvasCtx.lineTo(point.x, point.y);
    }.bind(this));
    this.canvasCtx.stroke();
  }
}
