'use strict';

var initializeUI = function(app) {
    var toolConfigs = {
        enabledToolButton: null,
        enabledOptions: [],

        options: {
            size: document.getElementById('sizeOption'),
            textSize: document.getElementById('textSizeOption'),
            color: document.getElementById('colorOption'),
        },

        init: function() {
            document.querySelector('.tools').addEventListener('click', this._handleToolChoose.bind(this), false);
        },
        selectTool: function(button) {
            var tool = button.dataset.tool;
            var options = button.dataset.options ? button.dataset.options.split(' ') : [];

            if (!tool) {
                return;
            }

            if (this.enabledToolButton) {
                this.enabledToolButton.classList.remove('active');
            }

            this.enabledOptions.forEach(function(optionName) {
                this.options[optionName].classList.add('hidden');
            }.bind(this));

            button.classList.add('active');

            options.forEach(function(optionName) {
                this.options[optionName].classList.remove('hidden');
            }.bind(this));

            this.enabledToolButton = button;
            this.enabledOptions = options;

            app.selectTool(tool);
        },
        _handleToolChoose: function(event) {
            var button = event.target.closest('button');
            if (!button || this.enabledToolButton == button) {
                return;
            }

            this.selectTool(button);

            event.preventDefault();
        }
    };

    var colorOption = {
        colorDropdown: document.getElementById('colorOption'),
        colorDropdownToggle: document.querySelector('#colorOption .dropdown-toggle'),
        colorPickerButton: document.querySelector('#colorOption .picker-button'),
        colorPicker: document.getElementById('colorPicker'),

        init: function() {
            this.colorPicker.addEventListener('change', this.changePicker.bind(this), false);

            this.colorDropdown
                .querySelector('.dropdown-menu')
                .addEventListener('click', this._handleColorAction.bind(this), false);
        },
        setColor: function(button, color) {
            this.colorDropdown.querySelectorAll('.active').forEach(function(element) {
                element.classList.remove('active');
            });
            button.classList.add('active');

            var svgRect = this.colorDropdownToggle.querySelector('svg');

            svgRect.style.fill = color;
            svgRect.style.stroke = color;

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
        },
        _handleColorAction: function(event) {
            var button = event.target.closest('button');
            if (!button) {
                return;
            }

            if (button.dataset.colorSet) {
                var color = button.dataset.colorSet;
                this.setColor(button, color);
            } else if (button.dataset.colorPicker != undefined) {
                this.openPicker();
            }

            event.preventDefault();
        }
    };

    var baseSizeOption = {
        input: null,
        inputValueUnit: 'px',
        optionName: null,
        _inputPreviousValue: null,

        init: function(optionName, dropdownElement, inputElement) {
            this.input = inputElement;
            this.dropdown = dropdownElement;
            this.optionName = optionName;
            this._inputPreviousValue = this.input.value;

            this.input.addEventListener('input', this._inputInput.bind(this), false);
            this.input.addEventListener('change', this._inputChange.bind(this), false);
            this.dropdown
                .querySelector('.dropdown-menu')
                .addEventListener('click', this._handleSizeAction.bind(this), false);
        },
        setSize: function(size) {
            app.setOption(this.optionName, size);

            this.input.value = size + this.inputValueUnit;
        },
        increaseSize: function(deltaSize) {
            deltaSize = deltaSize || 2;

            var newSize = app.options[this.optionName] + deltaSize;
            if (newSize > 99) {
                newSize = 99;
            }

            this.setSize(newSize);
        },
        decreaseSize: function(deltaSize) {
            deltaSize = deltaSize || 2;

            var newSize = app.options[this.optionName] - deltaSize;
            if (newSize < 1) {
                newSize = 1;
            }

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
        },
        _handleSizeAction: function(event) {
            var button = event.target.closest('button');
            if (!button) {
                return;
            }

            if (button.dataset.sizeSet) {
                var size = +button.dataset.sizeSet;
                this.setSize(size);
            } else if (button.dataset.sizeChange == 'increase') {
                this.increaseSize();
            } else if (button.dataset.sizeChange == 'decrease') {
                this.decreaseSize();
            }
        }
    };

    var dropImageOption = {
        dropareaHiddingTimerID: null,
        dragoverLastTimeFired: null,

        init: function() {
            // Note that dragstart and dragend events are not fired when dragging a file into the browser from the OS.
            // (https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop)

            // So we will set up a timer to hide droparea when dragover event will no longer fire
            window.addEventListener('dragover', this._dragImage.bind(this), false);
            window.addEventListener('drop', this._dropImage.bind(this), false);
        },
        _dragImage: function(event) {
            this.dragoverLastTimeFired = new Date();

            if (!this.dropareaHiddingTimerID) {
                spinner.showDropArea();

                this.dropareaHiddingTimerID = setInterval(function() {
                    var nowTime = new Date();
                    if ((nowTime - this.dragoverLastTimeFired) < 150) {
                        return
                    }

                    spinner.close();

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
        zoomDropdown: document.getElementById('zoomOption'),
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
        _hackCanvasCentering: function(event) {
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


    var spinner = {
        blockScreenElement: null,

        init: function(blockScreenElement) {
            this.blockScreenElement = blockScreenElement;
        },
        showDropArea: function() {
            this.blockScreenElement.screenBlock.open({
                message: 'Drop a file here',
                imageClass: 'icon-image',
                withBorder: true
            });
        },
        showLoadingMessage: function() {
            this.blockScreenElement.screenBlock.open({
                message: 'Loading a image',
                imageClass: 'icon-coffee',
                loading: true
            });
        },
        showSavingMessage: function() {
            this.blockScreenElement.screenBlock.open({
                message: 'Saving the image',
                imageClass: 'icon-coffee',
                loading: true
            });
        },
        close: function() {
            this.blockScreenElement.screenBlock.close();
        }
    };

    /*
        LET"S GO
    */
    toolConfigs.init();

    colorOption.init();
    window.colorOption = colorOption;

    window.sizeOption = Object.create(baseSizeOption);
    window.sizeOption.init(
        'size',
        document.getElementById('sizeOption'),
        document.getElementById('sizeOptionInput')
    );

    window.textSizeOption = Object.create(baseSizeOption);
    window.textSizeOption.init(
        'textSize',
        document.getElementById('textSizeOption'),
        document.getElementById('textSizeOptionInput')
    );

    zoomOption.init();
    window.zoomOption = zoomOption;

    spinner.init(document.getElementById('spinner'));
    window.spinner = spinner;

    var menuToggleBtn = document.getElementById('menu-toggle');
    var menuElement = document.getElementsByClassName('menu')[0];
    menuToggleBtn.addEventListener('click', function(event) {
        menuToggleBtn.classList.toggle('active');
        if (menuElement.dataset.open == undefined) {
            menuElement.dataset.open = '';
        } else {
            delete menuElement.dataset.open;
        }
    }, false);

    var fileBtn = document.getElementById('fileBtn');
    fileBtn.addEventListener('change', function(event) {
        if (fileBtn.files.length) {
            app.loadImageFromFileObj(fileBtn.files[0]);
        }
        event.preventDefault();
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
