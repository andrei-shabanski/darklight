import { globalLogger as logger } from '../../utils/logging';
import { loadImageFromUrl } from '../../utils/files';
import { Eventable } from '../../utils/other';
import Point from './point';
import Arrow from './shapes/arrow';
import Crop from './shapes/crop';
import Ellipse from './shapes/ellipse';
import Line from './shapes/line';
import Pen from './shapes/pen';
import Rectangle from './shapes/rectangle';
import Text from './shapes/text';
import Options from './options';

const EVENT_TYPES = {
  IMAGE_LOADING: 'image-loading',
  IMAGE_LOADED: 'image-loaded',
  IMAGE_NOT_LOADED: 'image-not-loaded',
  IMAGE_CHANGED: 'image-changed',
  OPTION_CHANGED: 'option-changed',
};

const STATE_TYPES = {
  INITIALIZED: 'init',
  LOADING: 'loading',
  DRAWING: 'drawing',
};

const EVENT_TO_STATE_MAPPING = {
  [EVENT_TYPES.IMAGE_LOADING]() {
    return STATE_TYPES.LOADING;
  },
  [EVENT_TYPES.IMAGE_LOADED]() {
    return STATE_TYPES.LOADING;
  },
  [EVENT_TYPES.IMAGE_NOT_LOADED]() {
    return this.image ? STATE_TYPES.LOADING : STATE_TYPES.INITIALIZED;
  },
};

export default class DrawingDesk extends Eventable {
  constructor(imageCanvas, drawingCanvas) {
    super();

    this.state = STATE_TYPES.INITIALIZED;

    this.imageCanvas = imageCanvas;
    this.imageCanvasCtx = imageCanvas.getContext('2d');
    this.drawingCanvas = drawingCanvas;
    this.drawingCanvasCtx = drawingCanvas.getContext('2d');

    this.tools = {
      text: {
        shape: Text,
        cursor: 'text',
      },
      pen: {
        shape: Pen,
        cursor: 'crosshair',
      },
      rectangle: {
        shape: Rectangle,
        cursor: 'crosshair',
      },
      ellipse: {
        shape: Ellipse,
        cursor: 'crosshair',
      },
      line: {
        shape: Line,
        cursor: 'crosshair',
      },
      arrow: {
        shape: Arrow,
        cursor: 'crosshair',
      },
      crop: {
        shape: Crop,
        cursor: 'crosshair',
        beforeCommit: null,
        afterCommit(shape) {
          if (shape.needCrop) {
            const rect = Point.getRectMeasure(shape.startPoint, shape.endPoint);
            this.crop(rect.point.x, rect.point.y, rect.width, rect.height);
          }
        },
      },
    };

    this.activeTool = null;

    this.options = new Options();
    this.image = null;
    this.shapes = [];
    this.currentShape = null;

    this.drawingCanvas.addEventListener(
      'mousedown',
      this.onDrawingCanvasMouseDown.bind(this),
      false
    );
  }

  onDrawingCanvasMouseDown(event) {
    logger.debug('Application is handling "mousedown" event');

    if (event.button === 0) {
      this.createShape(Point.fromEvent(event, this.options));
    }
  }

  emit(eventType, details) {
    logger.debug('Application is emitting "', eventType, '" event');

    const changeState = EVENT_TO_STATE_MAPPING[eventType];
    if (changeState) {
      this.state = EVENT_TO_STATE_MAPPING[eventType].call(this);
    }

    super.emit(eventType, details);
  }

  // TODO: move the function to actions
  loadImageFromDataTransfer(dataTransfer) {
    for (let index in dataTransfer.types) {
      if (dataTransfer.types[index] !== 'Files') {
        continue;
      }

      const dataTransferItem = dataTransfer.items[index];
      const file = dataTransferItem.getAsFile();

      if (!file || !file.type.startsWith('image/')) {
        continue;
      }
      this.loadImageFromFileObject(file);
      return;
    }
  }

  // TODO: move the function to actions
  loadImageFromUrl(url) {
    logger.info(
      'Application is loading a new image from ',
      url.length < 30 ? url : `${url.slice(0, 30)}...`
    );

    if (this.state !== STATE_TYPES.LOADING) {
      this.emit(EVENT_TYPES.IMAGE_LOADING);
    }

    loadImageFromUrl(url)
      .then(image => {
        logger.info('Image was been loaded from url');
        this.loadImage(image);
      })
      .catch(() => {
        logger.info("Image wasn't been loaded from url");
        this.emit(EVENT_TYPES.IMAGE_NOT_LOADED);
      });
  }

  // TODO: move the function to actions
  loadImageFromFileObject(file) {
    logger.info('Application is loading a new image from a file ');

    if (this.state !== STATE_TYPES.LOADING) {
      this.emit(EVENT_TYPES.IMAGE_LOADING);
    }

    this.loadImageFromUrl(URL.createObjectURL(file));
  }

  loadImage(image) {
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
  }

  setOption(name, value) {
    this.options[name] = value;

    if (this.currentShape) {
      this.currentShape.update({ options: this.options });
    }

    this.emit(EVENT_TYPES.OPTION_CHANGED, { optionName: name, value });
  }

  selectTool(toolName) {
    logger.info(`Application is selecting "${toolName}"`);

    const tool = this.tools[toolName];
    if (!tool) {
      return;
    }

    if (this.currentShape) {
      this.currentShape.commit();
    }

    if (tool !== this.activeTool) {
      this.activeTool = tool;
      this.drawingCanvas.style.cursor = tool.cursor;
    } else {
      this.activeTool = null;
      this.drawingCanvas.style.cursor = 'default';
    }
  }

  createShape(point) {
    if (!this.activeTool || this.currentShape) {
      return;
    }

    const ShapeClass = this.activeTool.shape;

    this.currentShape = new ShapeClass(
      this.drawingCanvasCtx,
      point,
      this.options,
      this.commitShape.bind(this)
    );

    logger.debug(`Application is creating a new ${this.currentShape.constructor.name} ${point}`);
  }

  commitShape() {
    if (!this.currentShape) {
      return;
    }

    logger.info(`Application is committing "${this.currentShape.constructor.name}"`);

    this.drawingCanvasCtx.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);

    if (this.activeTool.beforeCommit) {
      this.activeTool.beforeCommit.call(this, this.currentShape);
    }

    if (!this.currentShape.isEmpty()) {
      this.currentShape.canvasCtx = this.imageCanvasCtx;
      this.shapes.push(this.currentShape);
      this.draw();
    } else {
      logger.info("    but didn't push to the collection");
    }

    const { currentShape } = this;
    this.currentShape = null;

    if (this.activeTool.afterCommit) {
      this.activeTool.afterCommit.call(this, currentShape);
    }

    this.emit(EVENT_TYPES.IMAGE_CHANGED);
  }

  removeShape() {
    if (this.currentShape) {
      this.currentShape.commit();
    }

    if (this.shapes.length) {
      logger.info(
        'Application is removing the last shape ("',
        this.shapes[this.shapes.length - 1].constructor.name,
        '"'
      );
      this.shapes.splice(this.shapes.length - 1, 1);
      this.draw();
    }
  }

  resizeCanvas() {
    logger.info('Application is resizing canvases');

    const { width } = this.image;
    const { height } = this.image;

    this.imageCanvas.width = width;
    this.imageCanvas.height = height;

    this.drawingCanvas.width = width;
    this.drawingCanvas.height = height;
  }

  crop(x, y, width, height) {
    logger.info('Application is cropping the image (', [x, y, width, height].join(' ,'), ')');

    const croppedImageData = this.imageCanvasCtx.getImageData(x, y, width, height);
    this.loadImage(croppedImageData);
  }

  draw() {
    logger.info('Application is drawing the image and all shapes');

    this.imageCanvasCtx.clearRect(0, 0, this.imageCanvas.width, this.imageCanvas.height);
    if (this.image) {
      if (this.image.constructor === ImageData) {
        this.imageCanvasCtx.putImageData(
          this.image,
          0,
          0,
          0,
          0,
          this.image.width,
          this.image.height
        );
      } else {
        this.imageCanvasCtx.drawImage(this.image, 0, 0, this.image.width, this.image.height);
      }
    }

    this.shapes.forEach(shape => shape.draw());

    if (this.currentShape) {
      this.currentShape.draw();
    }
  }

  toDataURL() {
    return this.imageCanvas.toDataURL('image/png');
  }

  // TODO: replace this method with toBlobAsync
  toBlob(callback) {
    this.imageCanvas.toBlob(callback);
  }

  toBlobAsync() {
    return new Promise(resolve => this.imageCanvas.toBlob(resolve));
  }
}
