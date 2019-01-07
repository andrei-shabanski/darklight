'use strict';

window.DrawingDesk = (function() {
    var logger = new Logger(Logger.DEBUG, new Logger.ConsoleHandler());

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
        [EVENT_TYPES.IMAGE_LOADING]: function() { return STATE_TYPES.LOADING },
        [EVENT_TYPES.IMAGE_LOADED]: function() { return STATE_TYPES.LOADING },
        [EVENT_TYPES.IMAGE_NOT_LOADED]: function() { return this.image ? STATE_TYPES.LOADING : STATE_TYPES.INITIALIZED },
    };


    function Point(x, y) {
        this.x = x;
        this.y = y;
    }

    Point.fromEvent = function(event, options) {
        return new Point(
            options.zoomOut(event.offsetX),
            options.zoomOut(event.offsetY)
        );
    };

    Point.getRectPoints = function(point1, point2) {
        var xs = [point1.x, point2.x].sort();
        var ys = [point1.y, point2.y].sort();

        return {
            topLeftPoint: new Point(xs[0], ys[0]),
            bottomRightPoint: new Point(xs[1], ys[1])
        };
    };

    Point.getRectMeasure = function(point1, point2) {
        return {
            point: new Point(
                Math.min(point1.x, point2.x),
                Math.min(point1.y, point2.y)
            ),
            width: Math.abs(point1.x - point2.x),
            height: Math.abs(point1.y - point2.y)
        };
    };

    Point.prototype.clone = function() {
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
                get: function() { return self._globalOptions.scale; },
                set: function(value) { self._globalOptions.scale = value}
            },
            size: {
                get: function() { return self._localOptions.size; },
                set: function(value) { self._localOptions.size = value}
            },
            textSize: {
                get: function() { return self._localOptions.textSize; },
                set: function(value) { self._localOptions.textSize = value}
            },
            color: {
                get: function() { return self._localOptions.color; },
                set: function(value) { self._localOptions.color = value}
            },
        })
    };

    Options.prototype.clone = function() {
        var parent = this._parent || this;
        return new Options(parent);
    };

    Options.prototype.zoomIn = function(value) {
        return value * this.scale;
    };

    Options.prototype.zoomOut = function(value) {
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
                afterCommit: function(shape) {
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

    Application.prototype.onDrawingCanvasMouseDown = function(event) {
        logger.debug('Application is handling "mousedown" event');

        if (event.button === 0) {
            this.createShape(Point.fromEvent(event, this.options));
        }
    };

    Application.prototype.emit = function(eventType, details) {
        logger.debug('Application is emitting "', eventType, '" event');

        var changeState = EVENT_TO_STATE_MAPPING[eventType];
        if (changeState) {
            this.state = EVENT_TO_STATE_MAPPING[eventType].call(this);
        }

        Application.super.emit.apply(this, arguments);
    };

    Application.prototype.loadImageFromDataTransfer = function(dataTransfer) {
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

    Application.prototype.loadImageFromUrl = function(url) {
        logger.info('Application is loading a new image from ', url.length < 30 ? url : url.slice(0, 30) + '...');

        var self = this;

        if (this.state !== STATE_TYPES.LOADING) {
            this.emit(EVENT_TYPES.IMAGE_LOADING);
        }

        var image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = function() {
            self.loadImage(this);
        };
        image.onerror = function() {
            logger.warn("Image wasn't been loaded from url");
            self.emit(EVENT_TYPES.IMAGE_NOT_LOADED);
        };
        image.src = url;
    };

    Application.prototype.loadImageFromFileObject = function(file) {
        logger.info('Application is loading a new image from a file ');

        if (this.state !== STATE_TYPES.LOADING) {
            this.emit(EVENT_TYPES.IMAGE_LOADING);
        }

        this.loadImageFromUrl(URL.createObjectURL(file));
    };

    Application.prototype.loadImage = function(image) {
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

    Application.prototype.setOption = function(name, value) {
        this.options[name] = value;

        if (this.currentShape) {
            this.currentShape.update({options: this.options});
        }

        this.emit(EVENT_TYPES.OPTION_CHANGED, {optionName: name, value: value});
    };

    Application.prototype.selectTool = function(toolName) {
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

    Application.prototype.createShape = function(point) {
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

    Application.prototype.commitShape = function() {
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

    Application.prototype.removeShape = function() {
        if (this.currentShape) {
            this.currentShape.commit();
        }

        if (this.shapes.length) {
            logger.info('Application is removing the last shape ("', this.shapes[this.shapes.length - 1].constructor.name, '"');
            this.shapes.splice(this.shapes.length - 1, 1);
            this.draw();
        }
    };

    Application.prototype.resizeCanvas = function() {
        logger.info('Application is resizing canvases');

        var width = this.image.width;
        var height = this.image.height;

        this.imageCanvas.width = width;
        this.imageCanvas.height = height;

        this.drawingCanvas.width = width;
        this.drawingCanvas.height = height;
    };

    Application.prototype.crop = function(x, y, width, height) {
        logger.info('Application is cropping the image (', [x, y, width, height].join(' ,'), ')');

        var croppedImageData = this.imageCanvasCtx.getImageData(x, y, width, height);
        this.loadImage(croppedImageData);
    };

    Application.prototype.draw = function() {
        logger.info('Application is drawing the image and all shapes');

        this.imageCanvasCtx.clearRect(0, 0, this.imageCanvas.width, this.imageCanvas.height);
        if (this.image) {
            if (this.image.constructor === ImageData) {
                this.imageCanvasCtx.putImageData(this.image, 0, 0, 0, 0, this.image.width, this.image.height);
            } else {
                this.imageCanvasCtx.drawImage(this.image, 0, 0, this.image.width, this.image.height);
            }
        }

        this.shapes.forEach(function(shape) {
            shape.draw();
        });

        if (this.currentShape) {
            this.currentShape.draw();
        }
    };

    Application.prototype.toDataURL = function() {
        return this.imageCanvas.toDataURL('image/png');
    };

    Application.prototype.toBlob = function(callback) {
        this.imageCanvas.toBlob(callback);
    };


    function Shape(canvasContext, point, options, commitCallback) {
        this.canvasCtx = canvasContext;
        this.commitCallback = commitCallback;

        this.committed = false;

        this.startPoint = point;
        this.options = options.clone();
    }

    Shape.prototype.isEmpty = function() {
        return false;
    };

    Shape.prototype.update = function(data) {
        logger.debug(`Updating ${this.constructor.name}`);

        Object
            .keys(data)
            .forEach(function(key) {
                var value = data[key];

                if (key === 'options') {
                    this.options = value.clone();
                } else {
                    this[key] = value;
                }

            }.bind(this));

        this.draw();
    };

    Shape.prototype.draw = function() {
        logger.debug('Drawing "', this.constructor.name, '" (', this.committed ? 'committed' : 'not committed', ')');

        this.canvasCtx.restore();
        this.canvasCtx.save();

        if (!this.committed) {
            this.canvasCtx.clearRect(0, 0, this.canvasCtx.canvas.width, this.canvasCtx.canvas.height);
        }
    };

    Shape.prototype.commit = function() {
        logger.info('Committing "', this.constructor.name, '"');

        this.committed = true;
        this.commitCallback();
    };


    function MouseDrawableShape(canvasContext, point, options, commitCallback) {
        MouseDrawableShape.super.constructor.apply(this, arguments);

        this.endPoint = point.clone();

        this._onMouseDownBinded = this.onMouseDown.bind(this);
        this._onMouseMoveBinded = this.onMouseMove.bind(this);
        this._onMouseUpBinded = this.onMouseUp.bind(this);

        this.canvasCtx.canvas.addEventListener('mousedown', this._onMouseDownBinded, false);
        this.canvasCtx.canvas.addEventListener('mousemove', this._onMouseMoveBinded, false);
        this.canvasCtx.canvas.addEventListener('mouseup', this._onMouseUpBinded, false);
    }

    inherit(MouseDrawableShape, Shape);

    MouseDrawableShape.prototype.onMouseDown = function(event) {
        if (event.button !== 0) {
            return
        }
        logger.debug('"', this.constructor.name, '" is handling "mousedown"');
    };

    MouseDrawableShape.prototype.onMouseMove = function(event) {
        logger.debug('"', this.constructor.name, '" is handling "mousemove"');

        this.update({
            endPoint: Point.fromEvent(event, this.options)
        });
    };

    MouseDrawableShape.prototype.onMouseUp = function(event) {
        if (event.button !== 0) {
            return
        }

        logger.debug('"', this.constructor.name, '" is handling "mouseup"');

        this.commit();
    };

    MouseDrawableShape.prototype.commit = function() {
        this.canvasCtx.canvas.removeEventListener('mousedown', this._onMouseDownBinded);
        this.canvasCtx.canvas.removeEventListener('mousemove', this._onMouseMoveBinded);
        this.canvasCtx.canvas.removeEventListener('mouseup', this._onMouseUpBinded);

        MouseDrawableShape.super.commit.apply(this, arguments);
    };


    function Pen(canvasContext, point, options, commitCallback) {
        Pen.super.constructor.apply(this, arguments);

        this.points = [];
    }

    inherit(Pen, MouseDrawableShape);

    Pen.prototype.onMouseMove = function(event) {
        var points = this.points.slice();
        points.push(Point.fromEvent(event, this.options));

        this.update({points: points});
    };

    Pen.prototype.draw = function(scale) {
        Pen.super.draw.apply(this, arguments);

        this.canvasCtx.lineCap = 'round';
        this.canvasCtx.lineJoin = 'round';
        this.canvasCtx.strokeStyle = this.options.color;
        this.canvasCtx.lineWidth = this.options.size;

        this.canvasCtx.beginPath();
        this.canvasCtx.moveTo(this.startPoint.x, this.endPoint.y);
        this.points.forEach(function(point) {
            this.canvasCtx.lineTo(point.x, point.y);
        }.bind(this));
        this.canvasCtx.stroke();
    };


    function Line(canvasContext, point,options, commitCallback) {
        Line.super.constructor.apply(this, arguments);
    }

    inherit(Line, MouseDrawableShape);

    Line.prototype.draw = function(scale) {
        Line.super.draw.apply(this, arguments);

        this.canvasCtx.lineCap = 'round';
        this.canvasCtx.strokeStyle = this.options.color;
        this.canvasCtx.lineWidth = this.options.size;

        this.canvasCtx.beginPath();
        this.canvasCtx.moveTo(this.startPoint.x, this.startPoint.y);
        this.canvasCtx.lineTo(this.endPoint.x, this.endPoint.y);
        this.canvasCtx.stroke();
    };


    function Rectangle(canvasContext, point,options, commitCallback) {
        Rectangle.super.constructor.apply(this, arguments);
    }

    inherit(Rectangle, MouseDrawableShape);

    Rectangle.prototype.draw = function(scale) {
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


    function Ellipse(canvasContext, point,options, commitCallback) {
        Rectangle.super.constructor.apply(this, arguments);
    }

    inherit(Ellipse, MouseDrawableShape);

    Ellipse.prototype.draw = function(scale) {
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


    function Arrow(canvasContext, point,options, commitCallback) {
        Arrow.super.constructor.apply(this, arguments);
    }

    inherit(Arrow, Line);

    Arrow.prototype.draw = function(scale) {
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


    function Text(canvasContext, point,options, commitCallback) {
        Text.super.constructor.apply(this, arguments);

        this.text = '';

        this._onMouseDownBinded = this.onMouseDown.bind(this);
        this._onKeyDownBinded = this.onKeyDown.bind(this);
        this._onKeyPressedBinded = this.onKeyPressed.bind(this);

        this.canvasCtx.canvas.addEventListener('mousedown', this._onMouseDownBinded, false);
        window.addEventListener('keypress', this._onKeyPressedBinded, false);
        window.addEventListener('keydown', this._onKeyDownBinded, false);
        this.draw(); // draw the border
    }

    inherit(Text, Shape);

    Text.prototype.onMouseDown = function(event) {
        logger.debug('"Text" is handing "mousedown" event');

        this.commit();
    };

    Text.prototype.onKeyDown = function(event) {
        logger.debug('"Text" is handing "keydown" event');

        switch (event.keyCode) {
            case 13:
                if (!event.ctrlKey) {
                    return
                }
                this.commit();
                break;
            case 27:
                this.commit();
                break;
            case 46:
            case 8:
                if (this.text.length) {
                    this.update({text: this.text.slice(0, this.text.length - 1)});
                }
                break;
            default:
                return
        }

        event.preventDefault();
    };

    Text.prototype.onKeyPressed = function(event) {
        logger.debug('"Text" is handing "keypress" event');

        var char;

        if (event.code) {
            char = this._getChar(event);
        } else {
            logger.warn("Don't parse key");
        }

        if (char) {
            this.update({text: this.text + char});
        }

        event.preventDefault();
    };

    Text.prototype._getChar = function(event) {
        if (event.which == null) { // IE
            if (event.keyCode < 32) {
                return null;
            }
            return String.fromCharCode(event.keyCode)
        }

        if (event.which !== 0 && event.charCode !== 0) {
            if (event.which === 13) {
                return '\n';
            } else if (event.which < 32) {
                return null;
            }
            return String.fromCharCode(event.which);
        }

        return null;
    };

    Text.prototype.isEmpty = function() {
        return !this.text.length;
    };

    Text.prototype.draw = function(scale) {
        Text.super.draw.apply(this, arguments);

        var lines = this.text.split('\n');
        var textHeight = this.options.textSize;

        this.canvasCtx.textBaseline = 'top';
        this.canvasCtx.fillStyle = this.options.color;
        this.canvasCtx.font = Math.round(this.options.textSize) + 'px arial';

        lines.forEach(function(line, index) {
            this.canvasCtx.fillText(line, this.startPoint.x, this.startPoint.y + textHeight * index);
        }.bind(this));

        // draw a border
        if (!this.committed) {
            var maxLine = lines.sort(function(line1, line2) { return line2.length - line1.length })[0];
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

    Text.prototype.commit = function() {
        this.canvasCtx.canvas.removeEventListener('mousedown', this._onMouseDownBinded);
        window.removeEventListener('keypress', this._onKeyPressedBinded);
        window.removeEventListener('keydown', this._onKeyDownBinded);

        Text.super.commit.apply(this, arguments);
    };


    function Crop(canvasContext, point,options, commitCallback) {
        Crop.super.constructor.apply(this, arguments);

        this.needCrop = false;

        this._borders = {};
        this._onKeyPressedBinded = this.onKeyPressed.bind(this);

        window.addEventListener('keydown', this._onKeyPressedBinded, false);
    }

    inherit(Crop, MouseDrawableShape);

    Crop.prototype.isEmpty = function() {
        return true;
    };

    Crop.prototype.onMouseDown = function(event) {
        if (event.button !== 0) {
            return
        }

        logger.debug('"Crop" is handling "mousedown"');

        this.canvasCtx.canvas.addEventListener('mousemove', this._onMouseMoveBinded, false);

        this.update({
            startPoint: Point.fromEvent(event, this.options),
            endPoint: Point.fromEvent(event, this.options)
        });
    };

    Crop.prototype.onMouseUp = function(event) {
        if (event.button !== 0) {
            return
        }

        logger.debug('"Crop" is handling "mouseup"');
        this.canvasCtx.canvas.removeEventListener('mousemove', this._onMouseMoveBinded);
    };

    Crop.prototype.onKeyPressed = function(event) {
        logger.debug('"Crop " is handling "keydown"');

        var code = event.keyCode;

        switch (code) {
            case 13:
                this.crop();
                this.commit();
                break;
            case 27:
                this.commit();  // don't crop an image
                break;
        }
    };

    Crop.prototype.crop = function() {
        logger.debug('Set a flag to crop the image');
        this.needCrop = true;
    };

    Crop.prototype.draw = function(scale) {
        Crop.super.draw.apply(this, arguments);

        if (this.committed) {
            return;
        }

        var rect = Point.getRectMeasure(this.startPoint, this.endPoint);

        this.canvasCtx.globalAlpha = 0.6;
        this.canvasCtx.fillStyle = '#000000';
        this.canvasCtx.fillRect(0, 0, this.canvasCtx.canvas.width, this.canvasCtx.canvas.height);
        this.canvasCtx.clearRect(rect.point.x, rect.point.y, rect.width, rect.height);

        this.canvasCtx.globalAlpha = 1;
        this.canvasCtx.strokeStyle = '#aaaaaa';
        this.canvasCtx.lineWidth = 4;

        this._borders = {};
        this._borders.left = new Path2D();
        this._borders.left.moveTo(rect.point.x, rect.point.y);
        this._borders.left.lineTo(rect.point.x, rect.point.y + rect.height);
        this._borders.right = new Path2D();
        this._borders.right.moveTo(rect.point.x + rect.width, rect.point.y);
        this._borders.right.lineTo(rect.point.x + rect.width, rect.point.y + rect.height);
        this._borders.top = new Path2D();
        this._borders.top.moveTo(rect.point.x, rect.point.y);
        this._borders.top.lineTo(rect.point.x + rect.width, rect.point.y);
        this._borders.bottom = new Path2D();
        this._borders.bottom.moveTo(rect.point.x, rect.point.y + rect.height);
        this._borders.bottom.lineTo(rect.point.x + rect.width, rect.point.y + rect.height);

        Object.values(this._borders).forEach(this.canvasCtx.stroke.bind(this.canvasCtx));

        this.canvasCtx.beginPath();
        this.canvasCtx.lineWidth = 2;
        for (var i=1; i <= 3; i++) {
            this.canvasCtx.moveTo(rect.point.x + rect.width * i / 3, rect.point.y);
            this.canvasCtx.lineTo(rect.point.x + rect.width * i / 3, rect.point.y + rect.height);
            this.canvasCtx.moveTo(rect.point.x, rect.point.y + rect.height * i / 3);
            this.canvasCtx.lineTo(rect.point.x + rect.width, rect.point.y + rect.height * i / 3);
        }
        this.canvasCtx.stroke();

        var text = 'Hit to Enter';
        var textHeight;

        if ((rect.height - 20) < 64) {
            textHeight = Math.round(rect.height - 20);
        } else {
            textHeight = 64;
        }

        this.canvasCtx.font = textHeight + 'px arial';
        this.canvasCtx.textBaseline = 'top';
        this.canvasCtx.fillStyle = '#000000';

        var textWidth = this.canvasCtx.measureText(text).width;

        if ((rect.width - 10) < textWidth) {
            var textScale = textWidth / (rect.width - 10);
            textHeight = Math.max(Math.round(textHeight / textScale), 1);
            this.canvasCtx.font = textHeight + 'px arial';
            textWidth = this.canvasCtx.measureText(text).width;
        }

        this.canvasCtx.fillText(
            text,
            rect.point.x + (rect.width - textWidth) / 2,
            rect.point.y + (rect.height - textHeight) / 2
        );
    };

    Crop.prototype.commit = function() {
        window.removeEventListener('keydown', this._onKeyPressedBinded);

        Crop.super.commit.apply(this, arguments);
    };


    return Application;
})();
