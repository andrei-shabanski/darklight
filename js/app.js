'use strict';

var App = (function() {
    function getRectPoints(x0, y0, x1, y1) {
        if (x0 > x1) {
            var tmpX = x0;
            x0 = x1;
            x1 = tmpX;
        }
        if (y0 > y1) {
            var tmpY = y0;
            y0 = y1;
            y1 = tmpY;
        }

        return [{
            x: x0, y: y0
        }, {
            x: x1, y: y1
        }];
    }

    var logger = new Logger(Logger.DEBUG, new Logger.ConsoleHandler());




    function Options(options) {
        var defaultOptions = {
            size: 5,
            textSize: 32,
            color: '#ff00ff',
            originalScale: 1,
            scale: 1
        };

        Object.assign(this, defaultOptions, options);
    }

    Options.prototype.zoom = function(scale) {
        this.scale = scale;
    }




    function Application(
                getWindowSizeCallback,
                imageCanvas, drawingCanvas,
                textBtn, penBtn, rectangleBtn, ellipseBtn, lineBtn, arrowBtn,
                scaleOption, colorOption, sizeOption, textSizeOption) {
        Application.super.constructor.apply(this, arguments);

        this.state = Application.NOT_INITIALIZED;

        this.getWindowSizeCallback = getWindowSizeCallback;
        this.imageCanvas = imageCanvas;
        this.imageCanvasCtx = imageCanvas.getContext('2d');
        this.drawingCanvas = drawingCanvas;
        this.drawingCanvasCtx = drawingCanvas.getContext('2d');

        this.buttonConfigs = [{
            button: textBtn,
            shape: Text,
            cursor: 'text',
            optionNames: ['textSize', 'color']
        }, {
            button: penBtn,
            shape: Pen,
            cursor: 'crosshair',
            optionNames: ['size', 'color']
        }, {
            button: rectangleBtn,
            shape: Rectangle,
            cursor: 'crosshair',
            optionNames: ['size', 'color']
        }, {
            button: ellipseBtn,
            shape: Ellipse,
            cursor: 'crosshair',
            optionNames: ['size', 'color']
        }, {
            button: lineBtn,
            shape: Line,
            cursor: 'crosshair',
            optionNames: ['size', 'color']
        }, {
            button: arrowBtn,
            shape: Arrow,
            cursor: 'crosshair',
            optionNames: ['size', 'color']
        }, {
            button: cropBtn,
            shape: Crop,
            cursor: 'crosshair',
            optionNames: [],
            afterCommit: function(shape) {
                if (shape.needCrop) {
                    var points = getRectPoints(
                        shape.zp(shape.x0, 1),
                        shape.zp(shape.y0, 1),
                        shape.zp(shape.x1, 1),
                        shape.zp(shape.y1, 1)
                    );
                    this.crop(points[0].x, points[0].y, points[1].x - points[0].x, points[1].y - points[0].y);
                }
            }
        }];

        this.activatedButtonConfig = null;

        this.optionConfigs = {
            color: colorOption,
            size: sizeOption,
            textSize: textSizeOption
        };

        this.globalOptionConfigs = {
            scale: scaleOption
        }

        this.options = new Options({
            color: colorOption.value,
            size: +sizeOption.value,
            textSize: +textSizeOption.value
        });

        this.image = null;
        this.shapes = [];
        this.currentShapeClass = null;
        this.currentShape = null;

        this.initializeTools();

        this.drawingCanvas.addEventListener('mousedown', this.onDrawingCanvasMouseDown.bind(this), false);
        window.addEventListener('keydown', this.onKeyDown.bind(this), false);
        window.addEventListener('paste', this.onPaste.bind(this), false);
        window.addEventListener('copy', this.onCopy.bind(this), false);
        window.addEventListener('cut', this.onCopy.bind(this), false);
        window.addEventListener('wheel', this.onWheel.bind(this), false);

        this.emit(Application.INITIALIZED_EVENT);
    }

    inherit(Application, EventListener);

    Application.INITIALIZED_EVENT = 'initialized';
    Application.IMAGE_LOADING_EVENT = 'image-loading';
    Application.IMAGE_LOADED_EVENT = 'image-loaded';
    Application.IMAGE_NOT_LOADED_EVENT = 'image-not-loaded';
    Application.IMAGE_SAVING_EVENT = 'image-saving';
    Application.IMAGE_SAVED_EVENT = 'image-saved';

    Application.NOT_INITIALIZED_STATE = 0;
    Application.INITIALIZED_STATE = 1;
    Application.DRAWING_STATE = 2;
    Application.IMAGE_LOADING_STATE = 3;
    Application.IMAGE_SAVING_STATE = 4;

    var APP_EVENT_STATE_MAPPING = {
        [Application.INITIALIZED_EVENT]: function() { return Application.INITIALIZED_STATE },
        [Application.IMAGE_LOADING_EVENT]: function() { return Application.IMAGE_LOADING_STATE },
        [Application.IMAGE_LOADED_EVENT]: function() { return Application.DRAWING_STATE },
        [Application.IMAGE_NOT_LOADED_EVENT]: function() { return this.image ? Application.DRAWING : Application.INITIALIZED },
        [Application.IMAGE_SAVING_EVENT]: function() { return Application.IMAGE_SAVING_STATE },
        [Application.IMAGE_SAVED_EVENT]: function() { return Application.DRAWING },
        [Application.IMAGE_NOT_SAVED_EVENT]: function() { return Application.DRAWING }
    }

    Application.prototype.onKeyDown = function(event) {
        logger.debug('Application is handling "keydown" event');

        switch (event.keyCode) {
            case 90:  // Ctrl + Z
                if (event.ctrlKey) {
                    this.removeShape();
                }
                break
            case 83:  // Ctrl + S
                if (event.ctrlKey) {
                    this.download();
                }
                break
            default:
                return
        }

        event.preventDefault();
    }

    Application.prototype.onPaste = function(event) {
        logger.debug('Application is handling "paste" event');
        this.loadImageFromClipboard(event.clipboardData);
        event.preventDefault();
    }

    Application.prototype.onCopy = function(event) {
        logger.debug('Application is handling "copy"\\"cut" event');

        var data = this.toDataURL();
        event.clipboardData.setData('image/png', data);
        event.preventDefault();
    }

    Application.prototype.onWheel = function(event) {
        logger.debug('Application is handling "wheel" event');

        if (event.ctrlKey) {
            if (event.deltaY < 0) {
                this.globalOptionConfigs.scale.stepUp();
            } else {
                this.globalOptionConfigs.scale.stepDown();
            }

            this.globalOptionConfigs.scale.dispatchEvent(new Event('change'));
            event.preventDefault();
        }
    }

    Application.prototype.onDrawingCanvasMouseDown = function(event) {
        logger.debug('Application is handling "mousedown" event');

        if (event.button === 0) {
            this.createShape(event.offsetX, event.offsetY);
        }
    }

    Application.prototype.emit = function(eventType, details) {
        logger.debug('Application is emitting "', eventType, '" event');

        this.state = APP_EVENT_STATE_MAPPING[eventType].call(this);
        Application.super.emit.apply(this, arguments);
    }

    Application.prototype.initializeTools = function() {
        var self = this;

        function changeOption(optionName, value) {
            self.options[optionName] = value;
            if (self.currentShape) {
                self.currentShape.options = self.options;
                self.currentShape.draw();
            }
        }

        this.buttonConfigs.forEach(function(btnConfig) {
            btnConfig.button.addEventListener('click', function(event) {
                self.selectShape(btnConfig.shape);

                // deactivate a previous button and options
                if (self.activatedButtonConfig) {
                    self.activatedButtonConfig.button.classList.remove('active');
                    self.activatedButtonConfig.optionNames.forEach(function(optionName) {
                        hideElement(self.optionConfigs[optionName]);
                    }.bind(self));
                }

                // activate a new button and options
                btnConfig.button.classList.add('active');
                btnConfig.optionNames.forEach(function(optionName) {
                    showElement(self.optionConfigs[optionName]);
                }.bind(self));

                self.drawingCanvas.style.cursor = btnConfig.cursor;

                self.activatedButtonConfig = btnConfig;
            });
        });

        this.optionConfigs.textSize.addEventListener('change', function(event) {
            if (!event.target.valueAsNumber) {
                event.target.value = this.options.textSize;
                return
            }

            changeOption('textSize', event.target.valueAsNumber);
        }.bind(this));

        this.optionConfigs.size.addEventListener('change', function(event) {
            if (!event.target.valueAsNumber) {
                event.target.value = this.options.size;
                return
            }

            changeOption('size', event.target.valueAsNumber);
        }.bind(this));

        this.optionConfigs.color.addEventListener('change', function(event) {
            if (!event.target.value) {
                event.target.value = this.options.color;
                return
            }

            changeOption('color', event.target.value);
        }.bind(this));

        this.globalOptionConfigs.scale.addEventListener('change', function(event) {
            var scalePersent = event.target.valueAsNumber;

            if (this.options.originalScale) {
                var scale = this.options.originalScale / scalePersent;
            } else {
                scale = 1;
            }

            this.zoom(scale);
            this.resizeCanvas();
            this.draw();
        }.bind(this));
    }

    Application.prototype.loadImageFromClipboard = function(clipboard) {
        logger.info('Application is loading an image from the clipboard');

        this.emit(Application.IMAGE_LOADING_EVENT);

        for (var index in clipboard.types) {
            if (clipboard.types[index] != 'Files') {
                continue
            }

            var clipboardDataItem = clipboard.items[index];
            var file = clipboardDataItem.getAsFile();

            if (!file.type.startsWith('image/')) {
                continue
            }

            this.loadImageFromFileObj(file);
            return
        }

        this.emit(Application.IMAGE_NOT_LOADED_EVENT);

        logger.warn("Clipboard doesn't contain a image file");
    }

    Application.prototype.loadImageFromFileObj = function(file) {
        logger.info('Application is loading an image from a file object');

        var self = this;

        if (this.state !== Application.IMAGE_LOADING_STATE) {
            this.emit(Application.IMAGE_LOADING_EVENT);
        }

        if (!file.type.startsWith('image/')) {
            logger.warn("File isn't an image");
            this.emit(Application.IMAGE_NOT_LOADED_EVENT);
            return
        }

        var fileReader = new FileReader();
        fileReader.onload = function() {
            self.loadImageFromUrl(fileReader.result);
        }
        fileReader.onerror = function() {
            logger.warn("Image wasn't been loaded from a file");
            self.emit(Application.IMAGE_NOT_LOADED_EVENT);
        }
        fileReader.readAsDataURL(file);
    }

    Application.prototype.loadImageFromUrl = function(url) {
        logger.info('Application is loading a new image from ', url.length < 30 ? url : url.slice(0, 30) + '...');

        var self = this;

        if (this.state !== Application.IMAGE_LOADING_STATE) {
            this.emit(Application.IMAGE_LOADING_EVENT);
        }

        var image = new Image();
        image.onload = function() {
            self.loadImage(this);
        }
        image.onerror = function() {
            logger.warn("Image wasn't been loaded from url");
            self.emit(Application.IMAGE_NOT_LOADED_EVENT);
        }
        image.src = url;
    }

    Application.prototype.loadImage = function(image) {
        logger.info('Application loaded the image successfully');

        if (this.state !== Application.IMAGE_LOADING_STATE) {
            this.emit(Application.IMAGE_LOADING_EVENT);
        }

        if (this.currentShape) {
            this.currentShape.commit();
        }

        this.image = image;
        this.shapes = [];
        this.currentShape = null;

        this.zoom();
        this.resizeCanvas();
        this.draw();

        this.emit(Application.IMAGE_LOADED_EVENT);
    }

    Application.prototype.selectShape = function(shape) {
        logger.info('Application is selecting "', shape.name, '"');

        if (this.currentShape) {
            this.currentShape.commit();
        }

        this.currentShapeClass = shape;
    }

    Application.prototype.createShape = function(x, y) {
        if (!this.currentShapeClass || this.currentShape) {
            return
        }

        this.currentShape = new this.currentShapeClass(
            this.drawingCanvasCtx,
            x,
            y,
            this.options,
            this.commitShape.bind(this)
        );

        logger.debug('Application is creating a new "', this.currentShape.constructor.name, '"');
    }

    Application.prototype.commitShape = function() {
        if (!this.currentShape) {
            return
        }

        logger.info('Application is committing "', this.currentShape.constructor.name, '"');

        this.drawingCanvasCtx.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);

        if (this.activatedButtonConfig.beforeCommit) {
            this.activatedButtonConfig.beforeCommit.call(this, this.currentShape);
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

        if (this.activatedButtonConfig.afterCommit) {
            this.activatedButtonConfig.afterCommit.call(this, currentShape);
        }
    }

    Application.prototype.removeShape = function() {
        if (this.currentShape) {
            this.currentShape.commit();
        }

        if (this.shapes.length) {
            logger.info('Application is removing the last shape ("', this.shapes[this.shapes.length - 1].constructor.name, '"');
            this.shapes.splice(this.shapes.length - 1, 1);
            this.draw();
        }
    }

    Application.prototype.resizeCanvas = function() {
        logger.info('Application is resizing canvases');

        var width = 0;
        var height = 0;

        if (this.image) {
            width = this.image.width / this.options.scale;
            height = this.image.height / this.options.scale;
        }

        this.imageCanvas.width = width;
        this.imageCanvas.height = height;

        this.drawingCanvas.width = width;
        this.drawingCanvas.height = height;
    }

    Application.prototype.zoom = function(scale) {
        logger.info('Application is zooming canvases to ', scale);

        if (!scale && this.image) {
            var windowSize = this.getWindowSizeCallback();

            var scaleX = this.image.width / windowSize.width;
            var scaleY = this.image.height / windowSize.height;
            scale = Math.max(scaleX, scaleY, 1);

            this.options.originalScale = scale;

            if (scale < 1) {
                scale = 1;
            }
        } else if (!scale) {
            scale = 1;
        }

        this.options.zoom(scale);
    }

    Application.prototype.crop = function(x, y, width, height) {
        logger.info('Application is cropping the image (', [x, y, width, height].join(' ,'), ')');

        this.zoom(1);
        this.resizeCanvas();
        this.draw();

        var croppedImageData = this.imageCanvasCtx.getImageData(x, y, width, height);
        this.loadImage(croppedImageData);

        // in order to convert ImageData to Image, we'll load the image again
        var croppedImageBase64 = this.toDataURL();
        this.loadImageFromUrl(croppedImageBase64);
    }

    Application.prototype.draw = function() {
        logger.info('Application is drawing the image and all shapes');

        this.imageCanvasCtx.clearRect(0, 0, this.imageCanvas.width, this.imageCanvas.height);
        if (this.image) {
            if (this.image.constructor == ImageData) {
                this.imageCanvasCtx.putImageData(this.image, 0, 0, 0, 0, this.image.width / this.options.scale, this.image.height / this.options.scale);
            } else {
                this.imageCanvasCtx.drawImage(this.image, 0, 0, this.image.width / this.options.scale, this.image.height / this.options.scale);
            }
        }

        this.shapes.forEach(function(shape) {
            shape.draw(this.options.scale);
        }.bind(this));

        if (this.currentShape) {
            this.currentShape.draw(this.options.scale);
        }
    }

    Application.prototype.toDataURL = function() {
        if (this.currentShape) {
            this.currentShape.commit();
        }

        var preScale = this.options.scale;

        this.zoom(1);
        this.resizeCanvas();
        this.draw();

        var data = this.imageCanvas.toDataURL('image/png');

        this.zoom(preScale);
        this.resizeCanvas();
        this.draw();

        return data;
    }

    Application.prototype.download = function() {
        logger.info('Saving the image');

        if (this.state === Application.IMAGE_SAVING_STATE) {
            return
        }

        this.emit(Application.IMAGE_SAVING_EVENT);

        var base64Data = app.toDataURL();

        var now = new Date();
        var aTag = document.createElement('a');
        aTag.href = base64Data;
        aTag.download = 'Image-' + dateToString(now, 'dd-mm-yyyy_H-M-S') + '.png';
        aTag.click();

        this.emit(Application.IMAGE_SAVED_EVENT);
    }




    function Shape(canvasContext, x0, y0, options, commitCallback) {
        this.canvasCtx = canvasContext;
        this.commitCallback = commitCallback;

        this.x0 = x0;
        this.y0 = y0;
        this.options = Object.assign({}, options);

        this.committed = false;
    }

    Shape.prototype.zp = function(value, scale) {
        // zoom a point
        if (!!scale) {
            return value * this.options.scale / scale;
        }
        return value;
    }

    Shape.prototype.zo = function(value, scale) {
        // zoom an option
        //   ___
        //  (o O)
        // /( - )\
        //  -----
        scale = scale || this.options.scale;
        return value * this.options.originalScale / scale;
    }

    Shape.prototype.isEmpty = function() {
        return false;
    }

    Shape.prototype.update = function(data) {
        logger.debug('Updating "', this.constructor.name, '"');

        this.x0 = data.x0 || this.x0;
        this.y0 = data.y0 || this.y0;
        this.options = data.options ? Object.assign({}, data.options) : this.options;

        this.draw();
    }

    Shape.prototype.draw = function(scale) {
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




    function MouseDrawableShape(canvasContext, x0, y0, options, commitCallback) {
        MouseDrawableShape.super.constructor.apply(this, arguments);

        this.x1 = this.x0;
        this.y1 = this.y0;

        this._onMouseDownBinded = this.onMouseDown.bind(this);
        this._onMouseMoveBinded = this.onMouseMove.bind(this);
        this._onMouseUpBinded = this.onMouseUp.bind(this);

        this.canvasCtx.canvas.addEventListener('mousedown', this._onMouseDownBinded, false);
        this.canvasCtx.canvas.addEventListener('mousemove', this._onMouseMoveBinded, false);
        this.canvasCtx.canvas.addEventListener('mouseup', this._onMouseUpBinded, false);
    }

    inherit(MouseDrawableShape, Shape);

    MouseDrawableShape.prototype.update = function(data) {
        this.x1 = data.x1 || this.x1;
        this.y1 = data.y1 || this.y1;

        MouseDrawableShape.super.update.apply(this, arguments);
    }

    MouseDrawableShape.prototype.onMouseDown = function(event) {
        if (event.button !== 0) {
            return
        }
        logger.debug('"', this.constructor.name, '" is handling "mousedown"');
    }

    MouseDrawableShape.prototype.onMouseMove = function(event) {
        logger.debug('"', this.constructor.name, '" is handling "mousemove"');

        this.update({
            x1: event.offsetX,
            y1: event.offsetY
        });
    }

    MouseDrawableShape.prototype.onMouseUp = function(event) {
        if (event.button !== 0) {
            return
        }

        logger.debug('"', this.constructor.name, '" is handling "mouseup"');

        this.commit();
    }

    MouseDrawableShape.prototype.commit = function() {
        this.canvasCtx.canvas.removeEventListener('mousedown', this._onMouseDownBinded);
        this.canvasCtx.canvas.removeEventListener('mousemove', this._onMouseMoveBinded);
        this.canvasCtx.canvas.removeEventListener('mouseup', this._onMouseUpBinded);

        MouseDrawableShape.super.commit.apply(this, arguments);
    }




    function Pen(canvasContext, x0, y0, options, commitCallback) {
        Pen.super.constructor.apply(this, arguments);

        this.points = [];
    }

    inherit(Pen, MouseDrawableShape);

    Pen.prototype.onMouseMove = function(event) {
        this.points.push({
            x: event.offsetX,
            y: event.offsetY
        });

        this.draw();
    }

    Pen.prototype.draw = function(scale) {
        Pen.super.draw.apply(this, arguments);

        this.canvasCtx.lineCap = 'round';
        this.canvasCtx.strokeStyle = this.options.color;
        this.canvasCtx.lineWidth = this.zo(this.options.size, scale);

        this.canvasCtx.beginPath();
        this.canvasCtx.moveTo(this.zp(this.x0, scale), this.zp(this.y0, scale));
        this.points.forEach(function(point) {
            this.canvasCtx.lineTo(this.zp(point.x, scale), this.zp(point.y, scale));
        }.bind(this));
        this.canvasCtx.stroke();
    }




    function Line(canvasContext, x0, y0, options, commitCallback) {
        Line.super.constructor.apply(this, arguments);
    }

    inherit(Line, MouseDrawableShape);

    Line.prototype.draw = function(scale) {
        Line.super.draw.apply(this, arguments);

        this.canvasCtx.lineCap = 'round';
        this.canvasCtx.strokeStyle = this.options.color;
        this.canvasCtx.lineWidth = this.zo(this.options.size, scale);

        this.canvasCtx.beginPath();
        this.canvasCtx.moveTo(this.zp(this.x0, scale), this.zp(this.y0, scale));
        this.canvasCtx.lineTo(this.zp(this.x1, scale), this.zp(this.y1, scale));
        this.canvasCtx.stroke();
    }




    function Rectangle(canvasContext, x0, y0, options, commitCallback) {
        Rectangle.super.constructor.apply(this, arguments);
    }

    inherit(Rectangle, MouseDrawableShape);

    Rectangle.prototype.draw = function(scale) {
        Rectangle.super.draw.apply(this, arguments);

        this.canvasCtx.strokeStyle = this.options.color;
        this.canvasCtx.lineJoin = 'round';
        this.canvasCtx.lineWidth = this.zo(this.options.size, scale);

        this.canvasCtx.strokeRect(
            this.zp(this.x0, scale),
            this.zp(this.y0, scale),
            this.zp(this.x1 - this.x0, scale),
            this.zp(this.y1 - this.y0, scale)
        );
    }




    function Ellipse(canvasContext, x0, y0, options, commitCallback) {
        Rectangle.super.constructor.apply(this, arguments);
    }

    inherit(Ellipse, MouseDrawableShape);

    Ellipse.prototype.draw = function(scale) {
        Ellipse.super.draw.apply(this, arguments);

        var points = getRectPoints(
            this.zp(this.x0, scale),
            this.zp(this.y0, scale),
            this.zp(this.x1, scale),
            this.zp(this.y1, scale)
        );
        var pointTopLeft = points[0];
        var pointBottomRight = points[1];

        this.canvasCtx.strokeStyle = this.options.color;
        this.canvasCtx.lineWidth = this.zo(this.options.size, scale);

        this.canvasCtx.beginPath();
        this.canvasCtx.ellipse(
            pointTopLeft.x + (pointBottomRight.x - pointTopLeft.x) / 2, pointTopLeft.y + (pointBottomRight.y - pointTopLeft.y) / 2,
            (pointBottomRight.x - pointTopLeft.x) / 2, (pointBottomRight.y - pointTopLeft.y) / 2,
            0, 0, 2 * Math.PI
        );
        this.canvasCtx.stroke();
    }




    function Rectangle(canvasContext, x0, y0, options, commitCallback) {
        Rectangle.super.constructor.apply(this, arguments);
    }

    inherit(Rectangle, MouseDrawableShape);

    Rectangle.prototype.draw = function(scale) {
        Rectangle.super.draw.apply(this, arguments);

        this.canvasCtx.strokeStyle = this.options.color;
        this.canvasCtx.lineJoin = 'round';
        this.canvasCtx.lineWidth = this.zo(this.options.size, scale);

        this.canvasCtx.strokeRect(
            this.zp(this.x0, scale),
            this.zp(this.y0, scale),
            this.zp(this.x1 - this.x0, scale),
            this.zp(this.y1 - this.y0, scale)
        );
    }




    function Arrow(canvasContext, x0, y0, options, commitCallback) {
        Arrow.super.constructor.apply(this, arguments);
    }

    inherit(Arrow, Line);

    Arrow.prototype.draw = function(scale) {
        Arrow.super.draw.apply(this, arguments);

        var x0 = this.zp(this.x0, scale);
        var y0 = this.zp(this.y0, scale);
        var x1 = this.zp(this.x1, scale);
        var y1 = this.zp(this.y1, scale);

        var arrowLineLength = this.zo(this.options.size, scale) * 5;

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
    }





    function Text(canvasContext, x0, y0, options, commitCallback) {
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
    }

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
                    this.text = this.text.slice(0, this.text.length - 1);
                    this.draw();
                }
                break;
            default:
                return
        }

        event.preventDefault();
    }

    Text.prototype.onKeyPressed = function(event) {
        logger.debug('"Text" is handing "keypress" event');

        var char;

        if (event.code) {
            var char = this._getChar(event);
        } else {
            logger.warn("Don't parse key");
        }

        if (char) {
            this.text += char;
            this.draw();
        }

        event.preventDefault();
    }

    Text.prototype._getChar = function(event) {
        if (event.which == null) { // IE
            if (event.keyCode < 32) {
                return null;
            }
            return String.fromCharCode(event.keyCode)
        }

        if (event.which != 0 && event.charCode != 0) {
            if (event.which === 13) {
                return '\n';
            } else if (event.which < 32) {
                return null;
            }
            return String.fromCharCode(event.which);
        }

        return null;
    }

    Text.prototype.isEmpty = function() {
        return !this.text.length;
    }

    Text.prototype.draw = function(scale) {
        Text.super.draw.apply(this, arguments);

        var lines = this.text.split('\n');
        var textHeight = this.options.textSize;

        this.canvasCtx.textBaseline = 'top';
        this.canvasCtx.fillStyle = this.options.color;
        this.canvasCtx.font = Math.round(this.zo(this.options.textSize, scale)) + 'px arial';

        lines.forEach(function(line, index) {
            this.canvasCtx.fillText(line, this.zp(this.x0, scale), this.zp(this.y0 + textHeight * index, scale));
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
                this.zp(this.x0 - 4),
                this.zp(this.y0 - 4),
                textWith + 8,
                this.zo(this.options.textSize * lines.length + 8, scale)
            );
        }
    }

    Text.prototype.commit = function() {
        this.canvasCtx.canvas.removeEventListener('mousedown', this._onMouseDownBinded);
        window.removeEventListener('keypress', this._onKeyPressedBinded);
        window.removeEventListener('keydown', this._onKeyDownBinded);

        Text.super.commit.apply(this, arguments);
    }





    function Crop(canvasContext, x0, y0, options, commitCallback) {
        Crop.super.constructor.apply(this, arguments);

        this.needCrop = false;

        this._onKeyPressedBinded = this.onKeyPressed.bind(this);

        window.addEventListener('keydown', this._onKeyPressedBinded, false);
    }

    inherit(Crop, MouseDrawableShape);

    Crop.prototype.isEmpty = function() {
        return true;
    }

    Crop.prototype.onMouseDown = function(event) {
        if (event.button !== 0) {
            return
        }

        logger.debug('"Crop" is handling "mousedown"');

        this.canvasCtx.canvas.addEventListener('mousemove', this._onMouseMoveBinded, false);

        this.update({
            x0: event.offsetX,
            y0: event.offsetY,
            x1: event.offsetX,
            y1: event.offsetY
        });
    }

    Crop.prototype.onMouseUp = function(event) {
        if (event.button !== 0) {
            return
        }

        logger.debug('"Crop" is handling "mouseup"');
        this.canvasCtx.canvas.removeEventListener('mousemove', this._onMouseMoveBinded);
    }

    Crop.prototype.onKeyPressed = function(event) {
        logger.debug('"Crop " is handling "keydown"')

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
    }

    Crop.prototype.crop = function() {
        logger.debug('Set a flag to crop the image');
        this.needCrop = true;
    }

    Crop.prototype.draw = function(scale) {
        Crop.super.draw.apply(this, arguments);

        this.canvasCtx.globalAlpha = 0.5;
        this.canvasCtx.fillStyle = '#111111';
        this.canvasCtx.fillRect(0, 0, this.canvasCtx.canvas.width, this.canvasCtx.canvas.height);

        this.canvasCtx.clearRect(this.x0, this.y0, this.x1 - this.x0, this.y1 - this.y0);

        var text = 'Hit to Enter';
        var textHeight;
        var points = getRectPoints(this.x0, this.y0, this.x1, this.y1);

        if ((points[1].y - points[0].y - 20) < 64) {
            textHeight = Math.round(points[1].y - points[0].y - 20);
        } else {
            textHeight = 64;
        }

        this.canvasCtx.font = textHeight + 'px arial';
        this.canvasCtx.textBaseline = 'top';
        this.canvasCtx.fillStyle = '#111111';

        var textWidth = this.canvasCtx.measureText(text).width;

        if ((points[1].x - points[0].x - 10) < textWidth) {
            var textScale = textWidth / (points[1].x - points[0].x - 10);
            textHeight = Math.max(Math.round(textHeight / textScale), 1);
            this.canvasCtx.font = textHeight + 'px arial';
            var textWidth = this.canvasCtx.measureText(text).width;
        }

        this.canvasCtx.fillText(
            text,
            points[0].x + (points[1].x - points[0].x - textWidth) / 2,
            points[0].y + (points[1].y - points[0].y - textHeight) / 2
        );
    }

    Crop.prototype.commit = function() {
        window.removeEventListener('keydown', this._onKeyPressedBinded);

        Crop.super.commit.apply(this, arguments);
    }




    return Application;
})();
