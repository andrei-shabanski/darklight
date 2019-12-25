import Line from "./line";


export default class Arrow extends Line {

  draw(scale) {
    super.draw(scale);

    const x0 = this.startPoint.x;
    const y0 = this.startPoint.y;
    const x1 = this.endPoint.x;
    const y1 = this.endPoint.y;

    const arrowLineLength = this.options.zoomIn(Math.max(this.options.size, 10)) * 5;

    const alpha = Math.atan((y1 - y0) / (x1 - x0)) - Math.PI / 4;
    const dX0 = arrowLineLength * Math.cos(alpha);
    const dY0 = arrowLineLength * Math.sin(alpha);

    const beta = Math.PI / 2 - alpha;
    const dX1 = arrowLineLength * Math.cos(beta);
    const dY1 = arrowLineLength * Math.sin(beta);

    this.canvasCtx.beginPath();
    this.canvasCtx.moveTo(x1, y1);
    if (x1 >= x0) {
      this.canvasCtx.lineTo(x1 - dX0, y1 - dY0);
      this.canvasCtx.moveTo(x1, y1);
      this.canvasCtx.lineTo(x1 + dX1, y1 - dY1);
    } else {
      this.canvasCtx.lineTo(x1 + dX0, y1 + dY0);
      this.canvasCtx.moveTo(x1, y1);
      this.canvasCtx.lineTo(x1 - dX1, y1 + dY1);
    }
    this.canvasCtx.stroke();
  }

}
