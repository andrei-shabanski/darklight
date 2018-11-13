'use strict';

var initializeUI = function(app) {
    var textButton = document.getElementById('textBtn');
    var penButton = document.getElementById('penBtn');
    var rectangleButton = document.getElementById('rectangleBtn');
    var ellipseButton = document.getElementById('ellipseBtn');
    var lineButton = document.getElementById('lineBtn');
    var arrowButton = document.getElementById('arrowBtn');
    var cropButton = document.getElementById('cropBtn');

    var sizeDropdown = document.getElementById('sizeOption');
    var textSizeDropdown = document.getElementById('textSizeOption');
    var colorDropdown = document.getElementById('colorOption');
    var zoomDropdown = document.getElementById('zoomOption');

    var toolConfigs = {
        activeToolConfig: null,
        configs: [{
            tool: 'text',
            button: textButton,
            options: [textSizeDropdown, colorDropdown]
        }, {
            tool: 'pen',
            button: penButton,
            options: [sizeDropdown, colorDropdown]
        }, {
            tool: 'rectangle',
            button: rectangleButton,
            options: [sizeDropdown, colorDropdown]
        }, {
            tool: 'ellipse',
            button: ellipseButton,
            options: [sizeDropdown, colorDropdown]
        }, {
            tool: 'line',
            button: lineButton,
            options: [sizeDropdown, colorDropdown]
        }, {
            tool: 'arrow',
            button: arrowButton,
            options: [sizeDropdown, colorDropdown]
        }, {
            tool: 'crop',
            button: cropButton,
            options: [],
        }],

        init: function() {
            var self = this;

            this.configs.forEach(function(toolConfig) {
                toolConfig.button.addEventListener('click', function(event) {
                    if (toolConfig == self.activeToolConfig) {
                        event.preventDefault();
                    }

                    // deactivate a previous button and options
                    if (self.activeToolConfig) {
                        self.activeToolConfig.button.classList.toggle('active');
                        self.activeToolConfig.options.forEach(function(option) {
                            option.classList.add('hidden');
                        });
                    }

                    // activate a new button and options
                    toolConfig.button.classList.toggle('active');
                    toolConfig.options.forEach(function(option) {
                        option.classList.remove('hidden');
                    });

                    self.activeToolConfig = toolConfig;
                    app.selectTool(toolConfig.tool);

                    event.preventDefault();
                }, false);
            });
        }
    };

    var colorOption = {
        colorDropdown: colorDropdown,
        colorDropdownToggle: colorDropdown.querySelector('.dropdown-toggle'),
        colorPickerButton: document.getElementById('colorPickerButton'),
        colorPicker: document.getElementById('colorPicker'),

        init: function() {
            this.colorPickerButton.addEventListener('click', this.openPicker.bind(this), false);
            this.colorPicker.addEventListener('change', this.changePicker.bind(this), false);
        },
        setColor: function(button, color) {
            this.colorDropdown.querySelectorAll('.active').forEach(function(element) {
                element.classList.remove('active');
            });
            button.classList.add('active');

            this.colorDropdownToggle.style.fill = color;
            this.colorDropdownToggle.style.stroke = color;

            app.setOption('color', color);
        },
        openPicker: function() {
            this.colorPicker.value = app.options.color;
            this.colorPicker.click();
        },
        changePicker: function() {
            this.colorPickerButton.style.fill = colorPicker.value;
            this.colorPickerButton.style.stroke = colorPicker.value;

            this.setColor(this.colorPickerButton, this.colorPicker.value);
        }
    };

    var baseSizeOption = {
        input: null,
        inputValueUnit: 'px',
        appOptionName: null,
        _inputPreviousValue: null,

        init: function() {
            this._inputPreviousValue = this.input.value;

            this.input.addEventListener('input', this._inputInput.bind(this), false);
            this.input.addEventListener('change', this._inputChange.bind(this), false);

            this._inputChange({preventDefault: function(){}}); // really???
        },
        setSize: function(size) {
            app.setOption(this.appOptionName, size);

            this.input.value = size + this.inputValueUnit;
        },
        increaseSize: function() {
            if (app.options[this.appOptionName] >= 99) {
                return
            }

            var newSize = app.options[this.appOptionName] + 1;
            this.setSize(newSize);
        },
        decreaseSize: function() {
            if (app.options[this.appOptionName] <= 1) {
                return
            }

            var newSize = app.options[this.appOptionName] - 1;
            this.setSize(newSize);
        },
        _inputInput: function(event) {
            var sizeStr = this.input.value;
            if (sizeStr.match('^\\d{0,2}?' + this.inputValueUnit + '$') == null) {
                this.input.value = this._inputPreviousValue;
            } else {
                this._inputPreviousValue = sizeStr;
            }

            event.preventDefault();
        },
        _inputChange: function(event) {
            var sizeStr = this.input.value;
            var size = +sizeStr.slice(0, sizeStr.length - 2) || 1;

            this.setSize(size);
            event.preventDefault();
        }
    };

    var dropImageOption = {
        droparea: document.getElementById('dropArea'),
        dropareaHiddingTimerID: null,
        dragoverLastTimeFired: null,

        init: function() {
            // Note that dragstart and dragend events are not fired when dragging a file into the browser from the OS.
            // (https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop)

            // So we will set up a timer to hide droparea when dragover event will no longer fire
            document.body.addEventListener('dragover', this._dragImage.bind(this), false);
            document.body.addEventListener('drop', this._dropImage.bind(this), false);
        },
        _dragImage: function(event) {
            this.dragoverLastTimeFired = new Date();

            if (!this.dropareaHiddingTimerID) {
                showElement(this.droparea, 'hide');

                this.dropareaHiddingTimerID = setInterval(function() {
                    var nowTime = new Date();
                    if ((nowTime - this.dragoverLastTimeFired) < 150) {
                        return
                    }

                    hideElement(this.droparea, 'hide');
                    clearInterval(this.dropareaHiddingTimerID);
                    this.dropareaHiddingTimerID = null;
                }.bind(this), 50);
            }

            event.preventDefault();
        },
        _dropImage: function(event) {
            for (var index in event.dataTransfer.types) {
                if (event.dataTransfer.types[index] != 'Files') {
                    continue;
                }

                var dataItem = event.dataTransfer.items[index];
                var file = dataItem.getAsFile();

                if (!file.type.startsWith('image/')) {
                    continue;
                }

                var fileReader = new FileReader();
                fileReader.onload = function(event) {
                    app.loadImageFromUrl(event.target.result);
                }
                fileReader.readAsDataURL(file);
                break;
            }

            event.preventDefault();
        }
    };

    var zoomOption = {
        zoomDropdown: zoomDropdown,
        zoomInput: document.getElementById('zoomInput'),
        zoomSlider: document.getElementById('zoomSlider'),
        minScaleFactor: 1,
        maxScaleFactor: 3,
        _previousZoomInputValue: null,

        init: function() {
            this._previousZoomInputValue = this.zoomInput.value;

            this.zoomInput.addEventListener('input', this._inputInput.bind(this), false);
            this.zoomInput.addEventListener('change', this._inputChange.bind(this), false);
            this.zoomSlider.addEventListener('change', this._sliderChange.bind(this), false);
            window.addEventListener('wheel', this._windowWheel.bind(this), false);
        },
        setScale: function(scaleFactor) {
            var scale = 1;

            if (app.options.originalScale) {
                scale = app.options.originalScale / scaleFactor;
            }

            app.zoom(scale);
            app.resizeCanvas();
            app.draw();

            this._hackCanvasCentering();
        },
        _setInputValue: function(scaleFactor) {
            this.zoomInput.value = Math.round(scaleFactor * 100) + '%';
        },
        _setSliderValue: function(scaleFactor) {
            this.zoomSlider.value = scaleFactor;
        },
        _inputInput: function(event) {
            var scaleStr = this.zoomInput.value;
            if (scaleStr.match(/^\d{0,3}?%$/) == null) {
                this.zoomInput.value = this._previousZoomInputValue;
            } else {
                this._previousZoomInputValue = scaleStr;

                var scaleFactor = +scaleStr.slice(0, scaleStr.length - 1) / 100;
                if (scaleFactor != NaN && scaleFactor >= this.minScaleFactor && scaleFactor <= this.maxScaleFactor) {
                    this._setSliderValue(scaleFactor);
                    this.setScale(scaleFactor);
                }
            }

            event.preventDefault();
        },
        _inputChange: function(event) {
            var scaleStr = this.zoomInput.value;
            var scaleFactor = +scaleStr.slice(0, scaleStr.length - 1) / 100;

            if (scaleFactor != NaN && scaleFactor >= this.minScaleFactor && scaleFactor <= this.maxScaleFactor) {
                event.preventDefault();
                return;
            }

            if (scaleFactor < this.minScaleFactor) {
                this._previousZoomInputValue = '100%';
            } else if (scaleFactor > this.maxScaleFactor) {
                this._previousZoomInputValue = '300%';
            }
            this.zoomInput.value = this._previousZoomInputValue;

            var scaleStr = this.zoomInput.value;
            scaleFactor = +scaleStr.slice(0, scaleStr.length - 1) / 100;

            this.setScale(scaleFactor);
            event.preventDefault();
        },
        _sliderChange: function(event) {
            var scaleFactor = this.zoomSlider.valueAsNumber;

            this._setInputValue(scaleFactor);
            this.setScale(scaleFactor);
            event.preventDefault();
        },
        _windowWheel: function(event) {
            if (event.ctrlKey) {
                var scaleFactor = this.zoomSlider.valueAsNumber;
                if (event.deltaY < 0) {
                    scaleFactor += 0.2;
                } else {
                    scaleFactor -= 0.2;
                }

                if (scaleFactor >= this.minScaleFactor && scaleFactor <= this.maxScaleFactor) {
                    this._setInputValue(scaleFactor);
                    this._setSliderValue(scaleFactor);
                    this.setScale(scaleFactor);
                }

                event.preventDefault();
            }
        },
        _hackCanvasCentering: function() {
            var windowWidth = window.innerWidth;
            var windowHeight = window.innerHeight;
            var canvases = document.querySelectorAll('.canvases canvas');
            var canvasWidth = canvases[0].offsetWidth;
            var canvasHeight = canvases[0].offsetHeight;

            if (canvasWidth >= windowWidth) {
                canvases.forEach(function(canvas) {
                    canvas.style.left = 0;
                });
            } else {
                canvases.forEach(function(canvas) {
                    canvas.style.left = null;
                });
            }

            if (canvasHeight >= windowHeight) {
                canvases.forEach(function(canvas) {
                    canvas.style.top = 0;
                });
            } else {
                canvases.forEach(function(canvas) {
                    canvas.style.top = null;
                });
            }
        }
    };

    /*
        LET"S GO
    */

    toolConfigs.init();

    colorOption.init();
    window.colorOption = colorOption;
    document.querySelector('#colorOption .active').click();

    var sizeOption = Object.create(baseSizeOption);
    sizeOption.input = document.getElementById('sizeOptionInput');
    sizeOption.appOptionName = 'size';
    sizeOption.init();
    window.sizeOption = sizeOption;

    var textSizeOption = Object.create(baseSizeOption);
    textSizeOption.input = document.getElementById('textSizeOptionInput');
    textSizeOption.appOptionName = 'textSize';
    textSizeOption.init();
    window.textSizeOption = textSizeOption;

    zoomOption.init();
    window.zoomOption = zoomOption;

    var fileBtn = document.getElementById('fileBtn');
    fileBtn.addEventListener('change', function(event) {
        if (fileBtn.files.length) {
            app.loadImageFromFileObj(fileBtn.files[0]);
        }
        event.stopPropagation();
    }, false);

    var downloadButton = document.getElementById('downloadBtn');
    downloadButton.addEventListener('click', app.download.bind(app));

    dropImageOption.init();

    window.addEventListener('resize', function(event) {
        app.zoom();
        app.resizeCanvas();
        app.draw();
    }, false);
};
