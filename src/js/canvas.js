import {inherit, call, Eventable} from './utils';
import {DEBUG, ConsoleHandler, Logger} from './logging';


var logger = new Logger(DEBUG, new ConsoleHandler());

var EVENT_TYPES = {
  IMAGE_LOADING: 'image-loading',
  IMAGE_LOADED: 'image-loaded',
  IMAGE_NOT_LOADED: 'image-not-loaded',
  IMAGE_CHANGED: 'image-changed',
  OPTION_CHANGED: 'option-changed'
};

var STATE_TYPES = {
  INITIALIZED: 'init',
  LOADING: 'loading',
  DRAWING: 'drawing'
};

var EVENT_TO_STATE_MAPPING = {
  [EVENT_TYPES.IMAGE_LOADING]: function () {
    return STATE_TYPES.LOADING
  },
  [EVENT_TYPES.IMAGE_LOADED]: function () {
    return STATE_TYPES.LOADING
  },
  [EVENT_TYPES.IMAGE_NOT_LOADED]: function () {
    return this.image ? STATE_TYPES.LOADING : STATE_TYPES.INITIALIZED
  },
};


function Point(x, y) {
  this.x = x;
  this.y = y;
}

Point.fromEvent = function (event, options) {
  return new Point(
    options.zoomOut(event.offsetX),
    options.zoomOut(event.offsetY)
  );
};

Point.getRectCoords = function (point1, point2) {
  function compareNumbers(a, b) {
    return a - b;
  }

  var xs = [point1.x, point2.x].sort(compareNumbers);
  var ys = [point1.y, point2.y].sort(compareNumbers);

  return {
    topLeftPoint: new Point(xs[0], ys[0]),
    bottomRightPoint: new Point(xs[1], ys[1])
  };
};

Point.getRectMeasure = function (point1, point2) {
  return {
    point: new Point(
      Math.min(point1.x, point2.x),
      Math.min(point1.y, point2.y)
    ),
    width: Math.abs(point1.x - point2.x),
    height: Math.abs(point1.y - point2.y)
  };
};

Point.prototype.toString = function () {
  return `(${Math.round(this.x)}, ${Math.round(this.y)})`;
};

Point.prototype.clone = function () {
  return new Point(this.x, this.y);
};


var Options = function Options(parent) {
  var self = this;

  this._parent = parent;

  if (!!parent) {
    this._globalOptions = parent._globalOptions;
    this._localOptions = Object.assign({}, parent._localOptions);
  } else {
    this._globalOptions = {
      scale: 1
    };
    this._localOptions = {
      size: 5,
      textSize: 18,
      color: '#ff0000',
    };
  }

  Object.defineProperties(this, {
    scale: {
      get: function () {
        return self._globalOptions.scale;
      },
      set: function (value) {
        self._globalOptions.scale = value
      }
    },
    size: {
      get: function () {
        return self._localOptions.size;
      },
      set: function (value) {
        self._localOptions.size = value
      }
    },
    textSize: {
      get: function () {
        return self._localOptions.textSize;
      },
      set: function (value) {
        self._localOptions.textSize = value
      }
    },
    color: {
      get: function () {
        return self._localOptions.color;
      },
      set: function (value) {
        self._localOptions.color = value
      }
    },
  })
};

Options.prototype.clone = function () {
  var parent = this._parent || this;
  return new Options(parent);
};

Options.prototype.zoomIn = function (value) {
  return value * this.scale;
};

Options.prototype.zoomOut = function (value) {
  return value / this.scale;
};


function Application(imageCanvas, drawingCanvas) {
  Application.super.constructor.apply(this, arguments);

  this.state = STATE_TYPES.INITIALIZED;

  this.imageCanvas = imageCanvas;
  this.imageCanvasCtx = imageCanvas.getContext('2d');
  this.drawingCanvas = drawingCanvas;
  this.drawingCanvasCtx = drawingCanvas.getContext('2d');

  this.tools = {
    text: {
      shape: Text,
      cursor: 'text'
    },
    pen: {
      shape: Pen,
      cursor: 'crosshair'
    },
    rectangle: {
      shape: Rectangle,
      cursor: 'crosshair'
    },
    ellipse: {
      shape: Ellipse,
      cursor: 'crosshair'
    },
    line: {
      shape: Line,
      cursor: 'crosshair'
    },
    arrow: {
      shape: Arrow,
      cursor: 'crosshair'
    },
    crop: {
      shape: Crop,
      cursor: 'crosshair',
      beforeCommit: null,
      afterCommit: function (shape) {
        if (shape.needCrop) {
          var rect = Point.getRectMeasure(shape.startPoint, shape.endPoint);
          this.crop(rect.point.x, rect.point.y, rect.width, rect.height);
        }
      }
    }
  };

  this.activeTool = null;

  this.options = new Options();
  this.image = null;
  this.shapes = [];
  this.currentShape = null;

  this.drawingCanvas.addEventListener('mousedown', this.onDrawingCanvasMouseDown.bind(this), false);
}

inherit(Application, Eventable);

Application.prototype.onDrawingCanvasMouseDown = function (event) {
  logger.debug('Application is handling "mousedown" event');

  if (event.button === 0) {
    this.createShape(Point.fromEvent(event, this.options));
  }
};

Application.prototype.emit = function (eventType, details) {
  logger.debug('Application is emitting "', eventType, '" event');

  var changeState = EVENT_TO_STATE_MAPPING[eventType];
  if (changeState) {
    this.state = EVENT_TO_STATE_MAPPING[eventType].call(this);
  }

  Application.super.emit.apply(this, arguments);
};

Application.prototype.loadImageFromDataTransfer = function (dataTransfer) {
  for (var index in dataTransfer.types) {
    if (dataTransfer.types[index] !== 'Files') {
      continue
    }

    var dataTransferItem = dataTransfer.items[index];
    var file = dataTransferItem.getAsFile();

    if (!file || !file.type.startsWith('image/')) {
      continue
    }
    this.loadImageFromFileObject(file);
    return;
  }
};

Application.prototype.loadImageFromUrl = function (url) {
  logger.info('Application is loading a new image from ', url.length < 30 ? url : url.slice(0, 30) + '...');

  var self = this;

  if (this.state !== STATE_TYPES.LOADING) {
    this.emit(EVENT_TYPES.IMAGE_LOADING);
  }

  var image = new Image();
  image.crossOrigin = 'anonymous';
  image.onload = function () {
    self.loadImage(this);
  };
  image.onerror = function () {
    logger.warn("Image wasn't been loaded from url");
    self.emit(EVENT_TYPES.IMAGE_NOT_LOADED);
  };
  image.src = url;
};

Application.prototype.loadImageFromFileObject = function (file) {
  logger.info('Application is loading a new image from a file ');

  if (this.state !== STATE_TYPES.LOADING) {
    this.emit(EVENT_TYPES.IMAGE_LOADING);
  }

  this.loadImageFromUrl(URL.createObjectURL(file));
};

Application.prototype.loadImage = function (image) {
  logger.info('Application loaded the image successfully');

  if (this.state !== STATE_TYPES.LOADING) {
    this.emit(EVENT_TYPES.IMAGE_LOADING);
  }

  if (this.currentShape) {
    this.currentShape.commit();
  }

  this.image = image;
  this.shapes = [];
  this.currentShape = null;

  this.resizeCanvas();
  this.draw();

  this.emit(EVENT_TYPES.IMAGE_LOADED);
};

Application.prototype.setOption = function (name, value) {
  this.options[name] = value;

  if (this.currentShape) {
    this.currentShape.update({options: this.options});
  }

  this.emit(EVENT_TYPES.OPTION_CHANGED, {optionName: name, value: value});
};

Application.prototype.selectTool = function (toolName) {
  logger.info('Application is selecting "', toolName, '"');

  var tool = this.tools[toolName];
  if (!tool) {
    return;
  }

  if (this.currentShape) {
    this.currentShape.commit();
  }

  if (tool !== this.activeTool) {
    this.activeTool = tool;
    self.drawingCanvas.style.cursor = tool.cursor;
  } else {
    this.activeTool = null;
    self.drawingCanvas.style.cursor = 'default';
  }


};

Application.prototype.createShape = function (point) {
  if (!this.activeTool || this.currentShape) {
    return
  }

  this.currentShape = new this.activeTool.shape(
    this.drawingCanvasCtx,
    point,
    this.options,
    this.commitShape.bind(this)
  );

  logger.debug(`Application is creating a new ${this.currentShape.constructor.name} ${point}`);
};

Application.prototype.commitShape = function () {
  if (!this.currentShape) {
    return
  }

  logger.info('Application is committing "', this.currentShape.constructor.name, '"');

  this.drawingCanvasCtx.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);

  if (!!this.activeTool.beforeCommit) {
    this.activeTool.beforeCommit.call(this, this.currentShape);
  }

  if (!this.currentShape.isEmpty()) {
    this.currentShape.canvasCtx = this.imageCanvasCtx;
    this.shapes.push(this.currentShape);
    this.draw();
  } else {
    logger.info("    but didn't push to the collection");
  }

  var currentShape = this.currentShape;
  this.currentShape = null;

  if (!!this.activeTool.afterCommit) {
    this.activeTool.afterCommit.call(this, currentShape);
  }

  this.emit(EVENT_TYPES.IMAGE_CHANGED)
};

Application.prototype.removeShape = function () {
  if (this.currentShape) {
    this.currentShape.commit();
  }

  if (this.shapes.length) {
    logger.info('Application is removing the last shape ("', this.shapes[this.shapes.length - 1].constructor.name, '"');
    this.shapes.splice(this.shapes.length - 1, 1);
    this.draw();
  }
};

Application.prototype.resizeCanvas = function () {
  logger.info('Application is resizing canvases');

  var width = this.image.width;
  var height = this.image.height;

  this.imageCanvas.width = width;
  this.imageCanvas.height = height;

  this.drawingCanvas.width = width;
  this.drawingCanvas.height = height;
};

Application.prototype.crop = function (x, y, width, height) {
  logger.info('Application is cropping the image (', [x, y, width, height].join(' ,'), ')');

  var croppedImageData = this.imageCanvasCtx.getImageData(x, y, width, height);
  this.loadImage(croppedImageData);
};

Application.prototype.draw = function () {
  logger.info('Application is drawing the image and all shapes');

  this.imageCanvasCtx.clearRect(0, 0, this.imageCanvas.width, this.imageCanvas.height);
  if (this.image) {
    if (this.image.constructor === ImageData) {
      this.imageCanvasCtx.putImageData(this.image, 0, 0, 0, 0, this.image.width, this.image.height);
    } else {
      this.imageCanvasCtx.drawImage(this.image, 0, 0, this.image.width, this.image.height);
    }
  }

  this.shapes.forEach(function (shape) {
    shape.draw();
  });

  if (this.currentShape) {
    this.currentShape.draw();
  }
};

Application.prototype.toDataURL = function () {
  return this.imageCanvas.toDataURL('image/png');
};

Application.prototype.toBlob = function (callback) {
  this.imageCanvas.toBlob(callback);
};


function Shape(canvasContext, point, options, commitCallback) {
  this.canvasCtx = canvasContext;
  this.commitCallback = commitCallback;

  this.committed = false;

  this.startPoint = point;
  this.options = options.clone();
}

Shape.prototype.isEmpty = function () {
  return false;
};

Shape.prototype.update = function (data) {
  logger.debug(`Updating ${this.constructor.name}`);

  Object
    .keys(data)
    .forEach(function (key) {
      var value = data[key];

      if (key === 'options') {
        this.options = value.clone();
      } else {
        this[key] = value;
      }

    }.bind(this));

  this.draw();
};

Shape.prototype.draw = function () {
  logger.debug('Drawing "', this.constructor.name, '" (', this.committed ? 'committed' : 'not committed', ')');

  this.canvasCtx.restore();
  this.canvasCtx.save();

  if (!this.committed) {
    this.canvasCtx.clearRect(0, 0, this.canvasCtx.canvas.width, this.canvasCtx.canvas.height);
  }
};

Shape.prototype.commit = function () {
  logger.info('Committing "', this.constructor.name, '"');

  this.committed = true;
  this.commitCallback();
};


function InteractiveShape(canvasContext, point, options, commitCallback) {
  InteractiveShape.super.constructor.apply(this, arguments);

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

inherit(InteractiveShape, Shape);

InteractiveShape.prototype.onKeyDown = function (event) {
  this.keybindings.forEach(function (keybinding) {
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
};

InteractiveShape.prototype.onMouseOver = function (event) {
  var point = Point.fromEvent(event, this.options);
  var path = this._getPathByPoint(point);

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
};

InteractiveShape.prototype.onMouseDown = function (event) {
  if (event.button !== 0) {
    return;
  }

  var point = Point.fromEvent(event, this.options);

  this.activePath = this._getPathByPoint(point);

  if (!!this.activePath) {
    call(this.activePath.onMouseDown, this.activePath, [event]);
  } else {
    this.onCanvasMouseDown(event);
  }

  this.canvasCtx.canvas.addEventListener('mousemove', this._onMouseMoveBinded, false);
  this.canvasCtx.canvas.removeEventListener('mousemove', this._onMouseOverBinded);
};

InteractiveShape.prototype.onMouseMove = function (event) {
  if (!!this.activePath) {
    call(this.activePath.onMouseMove, this.activePath, [event]);
  } else {
    this.onCanvasMouseMove(event);
  }
};

InteractiveShape.prototype.onMouseUp = function (event) {
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
};

InteractiveShape.prototype.onCanvasMouseDown = function (event) {
};

InteractiveShape.prototype.onCanvasMouseMove = function (event) {
};

InteractiveShape.prototype.onCanvasMouseUp = function (event) {
};

InteractiveShape.prototype.commit = function () {
  window.removeEventListener('keydown', this._onKeyDownBinded);
  this.canvasCtx.canvas.removeEventListener('mousemove', this._onMouseOverBinded);
  this.canvasCtx.canvas.removeEventListener('mousedown', this._onMouseDownBinded);
  this.canvasCtx.canvas.removeEventListener('mousemove', this._onMouseMoveBinded);
  this.canvasCtx.canvas.removeEventListener('mouseup', this._onMouseUpBinded);

  this.activePath = null;

  InteractiveShape.super.commit.apply(this, arguments);
};

InteractiveShape.prototype._getPathByPoint = function (point) {
  var region;

  for (var i in this.pathes) {
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
};


function SimpleShape(canvasContext, point, options, commitCallback) {
  SimpleShape.super.constructor.apply(this, arguments);

  this.endPoint = point.clone();
}

inherit(SimpleShape, InteractiveShape);

SimpleShape.prototype.onCanvasMouseDown = function (event) {
  SimpleShape.super.onCanvasMouseDown.apply(this, arguments);

  this.update({
    startPoint: Point.fromEvent(event, this.options),
    endPoint: Point.fromEvent(event, this.options)
  });
};

SimpleShape.prototype.onCanvasMouseMove = function (event) {
  SimpleShape.super.onCanvasMouseMove.apply(this, arguments);

  this.update({
    endPoint: Point.fromEvent(event, this.options)
  });
};

SimpleShape.prototype.onCanvasMouseUp = function (event) {
  SimpleShape.super.onCanvasMouseUp.apply(this, arguments);

  this.commit();
};


function Pen(canvasContext, point, options, commitCallback) {
  Pen.super.constructor.apply(this, arguments);

  this.points = [point];
}

inherit(Pen, SimpleShape);

Pen.prototype.onCanvasMouseMove = function (event) {
  Pen.super.onCanvasMouseMove.apply(this, arguments);

  var points = this.points.slice();
  points.push(Point.fromEvent(event, this.options));

  this.update({points: points});
};

Pen.prototype.draw = function (scale) {
  Pen.super.draw.apply(this, arguments);

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
};


function Line(canvasContext, point, options, commitCallback) {
  Line.super.constructor.apply(this, arguments);
}

inherit(Line, SimpleShape);

Line.prototype.draw = function (scale) {
  Line.super.draw.apply(this, arguments);

  this.canvasCtx.lineCap = 'round';
  this.canvasCtx.strokeStyle = this.options.color;
  this.canvasCtx.lineWidth = this.options.size;

  this.canvasCtx.beginPath();
  this.canvasCtx.moveTo(this.startPoint.x, this.startPoint.y);
  this.canvasCtx.lineTo(this.endPoint.x, this.endPoint.y);
  this.canvasCtx.stroke();
};


function Rectangle(canvasContext, point, options, commitCallback) {
  Rectangle.super.constructor.apply(this, arguments);
}

inherit(Rectangle, SimpleShape);

Rectangle.prototype.draw = function (scale) {
  Rectangle.super.draw.apply(this, arguments);

  this.canvasCtx.strokeStyle = this.options.color;
  this.canvasCtx.lineJoin = 'round';
  this.canvasCtx.lineWidth = this.options.size;

  this.canvasCtx.strokeRect(
    this.startPoint.x,
    this.startPoint.y,
    this.endPoint.x - this.startPoint.x,
    this.endPoint.y - this.startPoint.y
  );
};


function Ellipse(canvasContext, point, options, commitCallback) {
  Rectangle.super.constructor.apply(this, arguments);
}

inherit(Ellipse, SimpleShape);

Ellipse.prototype.draw = function (scale) {
  Ellipse.super.draw.apply(this, arguments);

  var rect = Point.getRectMeasure(this.startPoint, this.endPoint);

  this.canvasCtx.strokeStyle = this.options.color;
  this.canvasCtx.lineWidth = this.options.size;

  this.canvasCtx.beginPath();
  this.canvasCtx.ellipse(
    rect.point.x + rect.width / 2, rect.point.y + rect.height / 2,
    rect.width / 2, rect.height / 2,
    0, 0, 2 * Math.PI
  );
  this.canvasCtx.stroke();
};


function Arrow(canvasContext, point, options, commitCallback) {
  Arrow.super.constructor.apply(this, arguments);
}

inherit(Arrow, Line);

Arrow.prototype.draw = function (scale) {
  Arrow.super.draw.apply(this, arguments);

  var x0 = this.startPoint.x;
  var y0 = this.startPoint.y;
  var x1 = this.endPoint.x;
  var y1 = this.endPoint.y;

  var arrowLineLength = this.options.zoomIn(Math.max(this.options.size, 10)) * 5;

  var alpha = Math.atan((y1 - y0) / (x1 - x0)) - Math.PI / 4;
  var dX0 = arrowLineLength * Math.cos(alpha);
  var dY0 = arrowLineLength * Math.sin(alpha);

  var beta = Math.PI / 2 - alpha;
  var dX1 = arrowLineLength * Math.cos(beta);
  var dY1 = arrowLineLength * Math.sin(beta);

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
};


function Text(canvasContext, point, options, commitCallback) {
  Text.super.constructor.apply(this, arguments);

  var self = this;
  this.text = '';

  this.keybindings = [{
    code: 'Enter',
    ctrl: true,
    callback: this.commit.bind(this)
  }, {
    code: 'Escape',
    callback: this.commit.bind(this)
  }, {
    code: 'Backspace',
    callback: function (event) {
      if (self.text.length) {
        self.update({text: self.text.slice(0, self.text.length - 1)});
      }
    }
  }, {
    callback: function (event) {
      var char;

      if (event.which === 13) {
        char = '\n';
      } else if (event.which < 32) {
        return;
      } else {
        char = event.key;
      }

      if (char.length) {
        self.update({text: self.text + char});
      }
    }
  }];

  this.draw(); // draw the border
}

inherit(Text, InteractiveShape);

Text.prototype.isEmpty = function () {
  return !this.text.length;
};

Text.prototype.onCanvasMouseDown = function (event) {
  this.commit();
};

Text.prototype.draw = function (scale) {
  Text.super.draw.apply(this, arguments);

  var lines = this.text.split('\n');
  var textHeight = this.options.textSize;

  this.canvasCtx.textBaseline = 'top';
  this.canvasCtx.fillStyle = this.options.color;
  this.canvasCtx.font = Math.round(this.options.textSize) + 'px arial';

  lines.forEach(function (line, index) {
    this.canvasCtx.fillText(line, this.startPoint.x, this.startPoint.y + textHeight * index);
  }.bind(this));

  // draw a border
  if (!this.committed) {
    var maxLine = lines.sort(function (line1, line2) {
      return line2.length - line1.length
    })[0];
    var textWith = this.canvasCtx.measureText(maxLine).width;
    this.canvasCtx.setLineDash([3]);
    this.canvasCtx.strokeStyle = '#000000';
    this.canvasCtx.lineWidth = 1;
    this.canvasCtx.strokeStyle = this.options.color;
    this.canvasCtx.strokeRect(
      this.startPoint.x - 4,
      this.startPoint.y - 4,
      textWith + 8,
      this.options.zoomIn(this.options.textSize * lines.length + 8)
    );
  }
};


function Crop(canvasContext, point, options, commitCallback) {
  Crop.super.constructor.apply(this, arguments);

  var self = this;

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

inherit(Crop, InteractiveShape);

Crop.prototype.isEmpty = function () {
  return true;
};

Crop.prototype.onCanvasMouseDown = function (event) {
  Crop.super.onCanvasMouseDown.apply(this, arguments);

  this.update({
    startPoint: Point.fromEvent(event, this.options),
    endPoint: Point.fromEvent(event, this.options)
  });
};

Crop.prototype.onCanvasMouseMove = function (event) {
  Crop.super.onCanvasMouseMove.apply(this, arguments);

  this.update({
    endPoint: Point.fromEvent(event, this.options)
  });
};

Crop.prototype.onCanvasMouseUp = function (event) {
  Crop.super.onCanvasMouseUp.apply(this, arguments);

  var rectCoords = Point.getRectCoords(
    this.startPoint,
    this.endPoint
  );

  this.update({
    startPoint: rectCoords.topLeftPoint,
    endPoint: rectCoords.bottomRightPoint
  });
};

Crop.prototype.updateRectCoords = function (event, borders) {
  var point = Point.fromEvent(event, this.options);
  var rectCoords = Point.getRectCoords(this.startPoint, this.endPoint);

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
};

Crop.prototype.move = function (event) {
  var point = Point.fromEvent(event, this.options);
  var topLeftPoint = this._movingRectCoords.topLeftPoint.clone();
  var bottomRightPoint = this._movingRectCoords.bottomRightPoint.clone();

  var deltaX = point.x - this._movingStartPoint.x;
  var deltaY = point.y - this._movingStartPoint.y;

  topLeftPoint.x += deltaX;
  topLeftPoint.y += deltaY;
  bottomRightPoint.x += deltaX;
  bottomRightPoint.y += deltaY;

  this.update({
    startPoint: topLeftPoint,
    endPoint: bottomRightPoint
  });
};

Crop.prototype.changeCursor = function (cursorType) {
  this.canvasCtx.canvas.style.cursor = cursorType;
};

Crop.prototype.draw = function (scale) {
  Crop.super.draw.apply(this, arguments);

  if (this.committed) {
    return;
  }

  var rect = Point.getRectMeasure(this.startPoint, this.endPoint);
  var pointSize = this.options.zoomOut(6);
  var borderSize = this.options.zoomOut(1);

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
  for (var i = 1; i <= 3; i++) {
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
};

Crop.prototype.crop = function () {
  this.needCrop = true;
  this.commit();
};

export const DrawingDesk = Application;
