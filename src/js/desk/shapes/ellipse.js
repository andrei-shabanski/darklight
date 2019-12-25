import { SimpleShape } from "./base";
import Point from "../point";

export default class Ellipse extends SimpleShape {

  draw(scale) {
    super.draw(scale);

    const rect = Point.getRectMeasure(this.startPoint, this.endPoint);

    this.canvasCtx.strokeStyle = this.options.color;
    this.canvasCtx.lineWidth = this.options.size;

    this.canvasCtx.beginPath();
    this.canvasCtx.ellipse(
      rect.point.x + rect.width / 2, rect.point.y + rect.height / 2,
      rect.width / 2, rect.height / 2,
      0, 0, 2 * Math.PI
    );
    this.canvasCtx.stroke();
  }

}
