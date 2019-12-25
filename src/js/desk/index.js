import {inherit, Eventable} from '../utils';
import {DEBUG, ConsoleHandler, globalLogger as logger} from '../logging';
import Point from "./point";
import Arrow from "./shapes/arrow";
import Crop from "./shapes/crop";
import Ellipse from "./shapes/ellipse";
import Line from "./shapes/line";
import Pen from "./shapes/pen";
import Rectangle from "./shapes/rectangle";
import Text from "./shapes/text";
import Options from "./options";


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


export function DrawingDesk(imageCanvas, drawingCanvas) {
  DrawingDesk.super.constructor.apply(this, arguments);

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

inherit(DrawingDesk, Eventable);

DrawingDesk.prototype.onDrawingCanvasMouseDown = function (event) {
  logger.debug('Application is handling "mousedown" event');

  if (event.button === 0) {
    this.createShape(Point.fromEvent(event, this.options));
  }
};

DrawingDesk.prototype.emit = function (eventType, details) {
  logger.debug('Application is emitting "', eventType, '" event');

  var changeState = EVENT_TO_STATE_MAPPING[eventType];
  if (changeState) {
    this.state = EVENT_TO_STATE_MAPPING[eventType].call(this);
  }

  DrawingDesk.super.emit.apply(this, arguments);
};

DrawingDesk.prototype.loadImageFromDataTransfer = function (dataTransfer) {
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

DrawingDesk.prototype.loadImageFromUrl = function (url) {
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

DrawingDesk.prototype.loadImageFromFileObject = function (file) {
  logger.info('Application is loading a new image from a file ');

  if (this.state !== STATE_TYPES.LOADING) {
    this.emit(EVENT_TYPES.IMAGE_LOADING);
  }

  this.loadImageFromUrl(URL.createObjectURL(file));
};

DrawingDesk.prototype.loadImage = function (image) {
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

DrawingDesk.prototype.setOption = function (name, value) {
  this.options[name] = value;

  if (this.currentShape) {
    this.currentShape.update({options: this.options});
  }

  this.emit(EVENT_TYPES.OPTION_CHANGED, {optionName: name, value: value});
};

DrawingDesk.prototype.selectTool = function (toolName) {
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

DrawingDesk.prototype.createShape = function (point) {
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

DrawingDesk.prototype.commitShape = function () {
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

DrawingDesk.prototype.removeShape = function () {
  if (this.currentShape) {
    this.currentShape.commit();
  }

  if (this.shapes.length) {
    logger.info('Application is removing the last shape ("', this.shapes[this.shapes.length - 1].constructor.name, '"');
    this.shapes.splice(this.shapes.length - 1, 1);
    this.draw();
  }
};

DrawingDesk.prototype.resizeCanvas = function () {
  logger.info('Application is resizing canvases');

  var width = this.image.width;
  var height = this.image.height;

  this.imageCanvas.width = width;
  this.imageCanvas.height = height;

  this.drawingCanvas.width = width;
  this.drawingCanvas.height = height;
};

DrawingDesk.prototype.crop = function (x, y, width, height) {
  logger.info('Application is cropping the image (', [x, y, width, height].join(' ,'), ')');

  var croppedImageData = this.imageCanvasCtx.getImageData(x, y, width, height);
  this.loadImage(croppedImageData);
};

DrawingDesk.prototype.draw = function () {
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

DrawingDesk.prototype.toDataURL = function () {
  return this.imageCanvas.toDataURL('image/png');
};

DrawingDesk.prototype.toBlob = function (callback) {
  this.imageCanvas.toBlob(callback);
};
