function compareNumbers(a, b) {
  return a - b;
}

export default class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  static fromEvent(event, options) {
    return new Point(options.zoomOut(event.offsetX), options.zoomOut(event.offsetY));
  }

  static getRectCoords(point1, point2) {
    const xs = [point1.x, point2.x].sort(compareNumbers);
    const ys = [point1.y, point2.y].sort(compareNumbers);

    return {
      topLeftPoint: new Point(xs[0], ys[0]),
      bottomRightPoint: new Point(xs[1], ys[1]),
    };
  }

  static getRectMeasure(point1, point2) {
    const xs = [point1.x, point2.x].sort(compareNumbers);
    const ys = [point1.y, point2.y].sort(compareNumbers);

    return {
      point: new Point(xs[0], ys[0]),
      width: Math.abs(point1.x - point2.x),
      height: Math.abs(point1.y - point2.y),
    };
  }

  toString() {
    return `(${Math.round(this.x)}, ${Math.round(this.y)})`;
  }

  clone() {
    return new Point(this.x, this.y);
  }
}
