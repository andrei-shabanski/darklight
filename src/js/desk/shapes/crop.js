import {InteractiveShape} from "./base";
import Point from "../point";


export default class Crop extends InteractiveShape {
  constructor(canvasContext, point, options, commitCallback) {
    super(canvasContext, point, options, commitCallback);

    const self = this;

    this.needCrop = false;

    function setDefaultCursor() {
      self.changeCursor('crosshair');
    }

    function setPathCursor() {
      self.changeCursor(this.cursor);
    }

    this.pathes = {
      leftBorder: {
        path: null,
        cursor: 'ew-resize',
        onMouseEnter: setPathCursor,
        onMouseLeave: setDefaultCursor,
        onMouseDown: setPathCursor,
        onMouseMove: function (event) {
          self.updateRectCoords(event, {left: true});
        },
        onMouseUp: setDefaultCursor
      },
      rightBorder: {
        path: null,
        cursor: 'ew-resize',
        onMouseEnter: setPathCursor,
        onMouseLeave: setDefaultCursor,
        onMouseDown: setPathCursor,
        onMouseMove: function (event) {
          self.updateRectCoords(event, {right: true});
        },
        onMouseUp: setDefaultCursor
      },
      topBorder: {
        path: null,
        cursor: 'ns-resize',
        onMouseEnter: setPathCursor,
        onMouseLeave: setDefaultCursor,
        onMouseDown: setPathCursor,
        onMouseMove: function (event) {
          self.updateRectCoords(event, {top: true});
        },
        onMouseUp: setDefaultCursor
      },
      bottomBorder: {
        path: null,
        cursor: 'ns-resize',
        onMouseEnter: setPathCursor,
        onMouseLeave: setDefaultCursor,
        onMouseDown: setPathCursor,
        onMouseMove: function (event) {
          self.updateRectCoords(event, {bottom: true});
        },
        onMouseUp: setDefaultCursor
      },
      topLeftPoint: {
        path: null,
        cursor: 'nwse-resize',
        onMouseEnter: setPathCursor,
        onMouseLeave: setDefaultCursor,
        onMouseDown: setPathCursor,
        onMouseMove: function (event) {
          self.updateRectCoords(event, {top: true, left: true});
        },
        onMouseUp: setDefaultCursor
      },
      topRightPoint: {
        path: null,
        cursor: 'nesw-resize',
        onMouseEnter: setPathCursor,
        onMouseLeave: setDefaultCursor,
        onMouseDown: setPathCursor,
        onMouseMove: function (event) {
          self.updateRectCoords(event, {top: true, right: true});
        },
        onMouseUp: setDefaultCursor
      },
      bottomLeftPoint: {
        path: null,
        cursor: 'nesw-resize',
        onMouseEnter: setPathCursor,
        onMouseLeave: setDefaultCursor,
        onMouseDown: setPathCursor,
        onMouseMove: function (event) {
          self.updateRectCoords(event, {bottom: true, left: true});
        },
        onMouseUp: setDefaultCursor
      },
      bottomRightPoint: {
        path: null,
        cursor: 'nwse-resize',
        onMouseEnter: setPathCursor,
        onMouseLeave: setDefaultCursor,
        onMouseDown: setPathCursor,
        onMouseMove: function (event) {
          self.updateRectCoords(event, {bottom: true, right: true});
        },
        onMouseUp: setDefaultCursor
      },
      body: {
        path: null,
        cursor: 'move',
        onMouseEnter: setPathCursor,
        onMouseLeave: setDefaultCursor,
        onMouseDown: function (event) {
          setPathCursor.call(this);
          self._movingStartPoint = Point.fromEvent(event, self.options);
          self._movingRectCoords = Point.getRectCoords(self.startPoint, self.endPoint);
        },
        onMouseMove: function (event) {
          self.move(event);
        },
        onMouseUp: setDefaultCursor
      },
    };

    this.keybindings = [{
      code: 'Enter',
      callback: this.crop.bind(this)
    }, {
      code: 'Escape',
      callback: this.commit.bind(this)
    }];
  }

  isEmpty() {
    return true;
  }

  onCanvasMouseDown(event) {
    super.onCanvasMouseDown(event);

    this.update({
      startPoint: Point.fromEvent(event, this.options),
      endPoint: Point.fromEvent(event, this.options)
    });
  }

  onCanvasMouseMove(event) {
    super.onCanvasMouseMove(event);

    this.update({
      endPoint: Point.fromEvent(event, this.options)
    });
  }

  onCanvasMouseUp(event) {
    super.onCanvasMouseUp(event);

    const rectCoords = Point.getRectCoords(
      this.startPoint,
      this.endPoint
    );

    this.update({
      startPoint: rectCoords.topLeftPoint,
      endPoint: rectCoords.bottomRightPoint
    });
  }

  updateRectCoords(event, borders) {
    const point = Point.fromEvent(event, this.options);
    const rectCoords = Point.getRectCoords(this.startPoint, this.endPoint);

    if (borders.left) {
      rectCoords.topLeftPoint.x = Math.min(point.x, rectCoords.bottomRightPoint.x);
    }
    if (borders.top) {
      rectCoords.topLeftPoint.y = Math.min(point.y, rectCoords.bottomRightPoint.y);
    }
    if (borders.right) {
      rectCoords.bottomRightPoint.x = Math.max(point.x, rectCoords.topLeftPoint.x);
    }
    if (borders.bottom) {
      rectCoords.bottomRightPoint.y = Math.max(point.y, rectCoords.topLeftPoint.y);
    }

    this.update({
      startPoint: rectCoords.topLeftPoint,
      endPoint: rectCoords.bottomRightPoint
    });
  }

  move(event) {
    const point = Point.fromEvent(event, this.options);
    const topLeftPoint = this._movingRectCoords.topLeftPoint.clone();
    const bottomRightPoint = this._movingRectCoords.bottomRightPoint.clone();

    const deltaX = point.x - this._movingStartPoint.x;
    const deltaY = point.y - this._movingStartPoint.y;

    topLeftPoint.x += deltaX;
    topLeftPoint.y += deltaY;
    bottomRightPoint.x += deltaX;
    bottomRightPoint.y += deltaY;

    this.update({
      startPoint: topLeftPoint,
      endPoint: bottomRightPoint
    });
  }

  changeCursor(cursorType) {
    this.canvasCtx.canvas.style.cursor = cursorType;
  }

  draw(scale) {
    super.draw(scale);

    if (this.committed) {
      return;
    }

    const rect = Point.getRectMeasure(this.startPoint, this.endPoint);
    const pointSize = this.options.zoomOut(6);
    const borderSize = this.options.zoomOut(1);

    this.canvasCtx.globalAlpha = 0.8;
    this.canvasCtx.fillStyle = '#000000';
    this.canvasCtx.fillRect(0, 0, this.canvasCtx.canvas.width, this.canvasCtx.canvas.height);
    this.canvasCtx.clearRect(rect.point.x, rect.point.y, rect.width, rect.height);

    this.canvasCtx.globalAlpha = 1;
    this.canvasCtx.lineWidth = borderSize;
    this.canvasCtx.strokeStyle = '#e2e2e2';
    this.canvasCtx.fillStyle = '#e2e2e2';

    // drawing borders and points
    this.canvasCtx.strokeRect(rect.point.x, rect.point.y, rect.width, rect.height);
    this.canvasCtx.fillRect(rect.point.x - pointSize / 2, rect.point.y - pointSize / 2, pointSize, pointSize);
    this.canvasCtx.fillRect(rect.point.x + rect.width - pointSize / 2, rect.point.y - pointSize / 2, pointSize, pointSize);
    this.canvasCtx.fillRect(rect.point.x - pointSize / 2, rect.point.y + rect.height - pointSize / 2, pointSize, pointSize);
    this.canvasCtx.fillRect(rect.point.x + rect.width - pointSize / 2, rect.point.y + rect.height - pointSize / 2, pointSize, pointSize);

    // drawing a grid
    this.canvasCtx.beginPath();
    for (let i = 1; i <= 3; i++) {
      this.canvasCtx.moveTo(rect.point.x + rect.width * i / 3, rect.point.y);
      this.canvasCtx.lineTo(rect.point.x + rect.width * i / 3, rect.point.y + rect.height);
      this.canvasCtx.moveTo(rect.point.x, rect.point.y + rect.height * i / 3);
      this.canvasCtx.lineTo(rect.point.x + rect.width, rect.point.y + rect.height * i / 3);
    }
    this.canvasCtx.stroke();

    // drawing interactive borders and points
    this.canvasCtx.globalAlpha = 0;
    this.canvasCtx.lineWidth = this.options.zoomOut(4);
    this.pathes.body.path = new Path2D();
    this.pathes.body.path.rect(rect.point.x, rect.point.y, rect.width, rect.height);
    this.pathes.leftBorder.path = new Path2D();
    this.pathes.leftBorder.path.moveTo(rect.point.x, rect.point.y);
    this.pathes.leftBorder.path.lineTo(rect.point.x, rect.point.y + rect.height);
    this.pathes.rightBorder.path = new Path2D();
    this.pathes.rightBorder.path.moveTo(rect.point.x + rect.width, rect.point.y);
    this.pathes.rightBorder.path.lineTo(rect.point.x + rect.width, rect.point.y + rect.height);
    this.pathes.topBorder.path = new Path2D();
    this.pathes.topBorder.path.moveTo(rect.point.x, rect.point.y);
    this.pathes.topBorder.path.lineTo(rect.point.x + rect.width, rect.point.y);
    this.pathes.bottomBorder.path = new Path2D();
    this.pathes.bottomBorder.path.moveTo(rect.point.x, rect.point.y + rect.height);
    this.pathes.bottomBorder.path.lineTo(rect.point.x + rect.width, rect.point.y + rect.height);
    this.pathes.topLeftPoint.path = new Path2D();
    this.pathes.topLeftPoint.path.rect(rect.point.x - pointSize / 2, rect.point.y - pointSize / 2, pointSize, pointSize);
    this.pathes.topRightPoint.path = new Path2D();
    this.pathes.topRightPoint.path.rect(rect.point.x + rect.width - pointSize / 2, rect.point.y - pointSize / 2, pointSize, pointSize);
    this.pathes.bottomLeftPoint.path = new Path2D();
    this.pathes.bottomLeftPoint.path.rect(rect.point.x - pointSize / 2, rect.point.y + rect.height - pointSize / 2, pointSize, pointSize);
    this.pathes.bottomRightPoint.path = new Path2D();
    this.pathes.bottomRightPoint.path.rect(rect.point.x + rect.width - pointSize / 2, rect.point.y + rect.height - pointSize / 2, pointSize, pointSize);

    this.canvasCtx.stroke(this.pathes.body.path);
    this.canvasCtx.stroke(this.pathes.topLeftPoint.path);
    this.canvasCtx.stroke(this.pathes.topRightPoint.path);
    this.canvasCtx.stroke(this.pathes.bottomLeftPoint.path);
    this.canvasCtx.stroke(this.pathes.bottomRightPoint.path);
    this.canvasCtx.stroke(this.pathes.leftBorder.path);
    this.canvasCtx.stroke(this.pathes.rightBorder.path);
    this.canvasCtx.stroke(this.pathes.topBorder.path);
    this.canvasCtx.stroke(this.pathes.bottomBorder.path);
  }

  crop() {
    this.needCrop = true;
    this.commit();
  }

}
