import { call } from '../../../utils/other';
import { globalLogger as logger } from '../../../utils/logging';
import Point from '../point';

export class Shape {
  constructor(canvasContext, point, options, commitCallback) {
    this.canvasCtx = canvasContext;
    this.commitCallback = commitCallback;

    this.committed = false;

    this.startPoint = point;
    this.options = options.clone();
  }

  isEmpty() {
    return false;
  }

  update(data) {
    logger.debug(`Updating ${this.constructor.name}`);

    Object.keys(data).forEach(
      function(key) {
        const value = data[key];

        if (key === 'options') {
          this.options = value.clone();
        } else {
          this[key] = value;
        }
      }.bind(this)
    );

    this.draw();
  }

  draw(scale) {
    logger.debug(
      `Drawing "${this.constructor.name}" (${this.committed ? 'committed' : 'not committed'})`
    );

    this.canvasCtx.restore();
    this.canvasCtx.save();

    if (!this.committed) {
      this.canvasCtx.clearRect(0, 0, this.canvasCtx.canvas.width, this.canvasCtx.canvas.height);
    }
  }

  commit() {
    logger.info(`Committing "${this.constructor.name}"`);

    this.committed = true;
    this.commitCallback();
  }
}

export class InteractiveShape extends Shape {
  constructor(canvasContext, point, options, commitCallback) {
    super(canvasContext, point, options, commitCallback);

    // this.pathes = {
    //     'border': {
    //         path: new Path2D(),
    //         onMouseEnter: function (event) {...},
    //         onMouseLeave: function (event) {...},
    //         onMouseDown: function (event) {...},
    //         onMouseMove: function (event) {...},
    //         onMouseUp: function (event) {...}
    //     }
    // };
    this.pathes = {};
    this.activePath = null;

    // this.keybindings = [{
    //     code: 'KeyF',
    //     shift: true,
    //     alt: false,
    //     ctrl: false,
    //     callback: function(event) {...}
    // }, {
    //     keyRegex: '.*',
    //     shift: true,
    //     alt: false,
    //     ctrl: false,
    //     callback: function(event) {...}
    // }];
    this.keybindings = [];

    this._pathUnderMouse = null;

    this._onKeyDownBinded = this.onKeyDown.bind(this);
    this._onMouseOverBinded = this.onMouseOver.bind(this);
    this._onMouseDownBinded = this.onMouseDown.bind(this);
    this._onMouseMoveBinded = this.onMouseMove.bind(this);
    this._onMouseUpBinded = this.onMouseUp.bind(this);

    window.addEventListener('keydown', this._onKeyDownBinded, false);
    this.canvasCtx.canvas.addEventListener('mousedown', this._onMouseDownBinded, false);
    this.canvasCtx.canvas.addEventListener('mousemove', this._onMouseMoveBinded, false);
    this.canvasCtx.canvas.addEventListener('mouseup', this._onMouseUpBinded, false);
  }

  onKeyDown(event) {
    this.keybindings.forEach(function(keybinding) {
      if (keybinding.shift && !event.shiftKey) {
        return;
      }
      if (keybinding.ctrl && !event.ctrlKey) {
        return;
      }
      if (keybinding.alt && !event.altKey) {
        return;
      }
      if (keybinding.code && event.code !== keybinding.code) {
        return;
      }
      if (keybinding.key && event.key !== keybinding.key) {
        return;
      }
      if (keybinding.keyRegex && event.key.match(keybinding.keyRegex)) {
        return;
      }
      if (keybinding.codeRegex && event.code.match(keybinding.codeRegex)) {
        return;
      }
      keybinding.callback(event);
    });
    event.preventDefault();
  }

  onMouseOver(event) {
    const point = Point.fromEvent(event, this.options);
    const path = this._getPathByPoint(point);

    if (path === this._pathUnderMouse) {
      return;
    }
    if (this._pathUnderMouse) {
      call(this._pathUnderMouse.onMouseLeave, this._pathUnderMouse, [event]);
    }
    if (path) {
      call(path.onMouseEnter, path, [event]);
    }
    this._pathUnderMouse = path;
  }

  onMouseDown(event) {
    if (event.button !== 0) {
      return;
    }

    const point = Point.fromEvent(event, this.options);

    this.activePath = this._getPathByPoint(point);

    if (!!this.activePath) {
      call(this.activePath.onMouseDown, this.activePath, [event]);
    } else {
      this.onCanvasMouseDown(event);
    }

    this.canvasCtx.canvas.addEventListener('mousemove', this._onMouseMoveBinded, false);
    this.canvasCtx.canvas.removeEventListener('mousemove', this._onMouseOverBinded);
  }

  onMouseMove(event) {
    if (!!this.activePath) {
      call(this.activePath.onMouseMove, this.activePath, [event]);
    } else {
      this.onCanvasMouseMove(event);
    }
  }

  onMouseUp(event) {
    if (event.button !== 0) {
      return;
    }

    if (!!this.activePath) {
      call(this.activePath.onMouseUp, this.activePath, [event]);
    } else {
      this.onCanvasMouseUp(event);
    }

    this.activePath = null;

    this.canvasCtx.canvas.removeEventListener('mousemove', this._onMouseMoveBinded);
    this.canvasCtx.canvas.addEventListener('mousemove', this._onMouseOverBinded);
  }

  onCanvasMouseDown(event) {}

  onCanvasMouseMove(event) {}

  onCanvasMouseUp(event) {}

  commit() {
    window.removeEventListener('keydown', this._onKeyDownBinded);
    this.canvasCtx.canvas.removeEventListener('mousemove', this._onMouseOverBinded);
    this.canvasCtx.canvas.removeEventListener('mousedown', this._onMouseDownBinded);
    this.canvasCtx.canvas.removeEventListener('mousemove', this._onMouseMoveBinded);
    this.canvasCtx.canvas.removeEventListener('mouseup', this._onMouseUpBinded);

    this.activePath = null;

    super.commit();
  }

  _getPathByPoint(point) {
    let region;

    for (const i in this.pathes) {
      region = this.pathes[i];
      if (!region.path) {
        continue;
      }
      if (this.canvasCtx.isPointInPath(region.path, point.x, point.y)) {
        return region;
      }
      if (this.canvasCtx.isPointInStroke(region.path, point.x, point.y)) {
        return region;
      }
    }

    return null;
  }
}

export class SimpleShape extends InteractiveShape {
  constructor(canvasContext, point, options, commitCallback) {
    super(canvasContext, point, options, commitCallback);

    this.endPoint = point.clone();
  }

  onCanvasMouseDown(event) {
    super.onCanvasMouseDown(event);

    this.update({
      startPoint: Point.fromEvent(event, this.options),
      endPoint: Point.fromEvent(event, this.options),
    });
  }

  onCanvasMouseMove(event) {
    super.onCanvasMouseMove(event);

    this.update({
      endPoint: Point.fromEvent(event, this.options),
    });
  }

  onCanvasMouseUp(event) {
    super.onCanvasMouseUp(event);

    this.commit();
  }
}
