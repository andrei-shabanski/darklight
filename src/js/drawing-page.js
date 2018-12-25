'use strict';

var initializePage = function(app) {
    var logger = new Logger(Logger.DEBUG, new Logger.ConsoleHandler());



    function FirebaseImageStorage(imageId) {
        this.imageId = imageId;
        this.url = 'https://firebasestorage.googleapis.com/v0/b/darklight-image-editor.appspot.com/o/images%2F' + imageId + '?alt=media';
        this._refFile = firebase.storage().ref('images/' + imageId);
    }

    FirebaseImageStorage.prototype.load = function() {
        return this._refFile.getDownloadURL();
    }

    FirebaseImageStorage.prototype.save = function(blob) {
        return this._refFile.put(blob);
    }

    FirebaseImageStorage.prototype.delete = function() {
        return this._refFile.delete();
    }


    var imageManager = {
        imageStorage: null,
        loadingImageFromUrl: false,

        saveBtn: document.getElementById('saveBtn'),
        imageEditLinkBtn: document.getElementById('imageEditLinkBtn'),
        imageDirectLinkBtn: document.getElementById('imageDirectLinkBtn'),

        isSaving: false,
        hasUnsavedChanges: false,

        init: function() {
            var self = this;

            this.imageEditLinkBtn.addEventListener('click', function(event) {
                copyToClipboard(location.href);
                event.preventDefault();
            }, false);
            this.imageDirectLinkBtn.addEventListener('focus', function(event) {
                copyToClipboard(self.imageStorage.url);
                event.preventDefault();
            }, false);
        },

        onLoadSuccess: function() {
            logger.debug('Image was loaded.');

            if (!this.loadingImageFromUrl) {
                if (this.imageStorage) {
                    this.save();
                }

                this.createImageStorage();
                this.save(true);
            } else {
                // omg. imageStorage is already created
                this.loadingImageFromUrl = false;
            }
        },

        onLoadFailure: function(error) {
            logger.error('Image was not loaded. ', error);

            if (this.loadingImageFromUrl) {
                this.loadingImageFromUrl = false;
                return
            }
        },

        loadImageFromStorage: function(imageId) {
            var self = this;

            this.createImageStorage(imageId);
            this.loadingImageFromUrl = true;
            // this.imageStorage
            //     .load()
            //     .then(app.loadImageFromUrl.bind(app))
            //     .catch(function(error) {
            //         self.onLoadFailure(error);
            //     });
            app.loadImageFromUrl(this.imageStorage.url);
        },

        setImageIdToLocation: function(imageId) {
            history.pushState({imageId: imageId}, '', imageId);
        },

        parseImageIdFromLocation: function() {
            var matchedPath = location.pathname.match(/\/(\w+\.png)/);
            if (matchedPath) {
                return matchedPath[1];
            }

            return null;
        },

        createImageStorage: function(imageId) {
            if (!imageId) {
                imageId = randomString() + '.png';
                this.setImageIdToLocation(imageId);
            }

            this.imageStorage = new FirebaseImageStorage(imageId);
        },

        save: function(force) {
            force = force != undefined ? force : false;

            if ((!this.hasUnsavedChanges || this.isSaving) && !force) {
                return
            }

            var self = this;

            this.hasUnsavedChanges = false;
            this.isSaving = true;

            saveButton.changeState('saving');

            return app.toBlob(function(blob) {
                self.imageStorage
                    .save(blob)
                    .then(function(snapshot) {
                        saveButton.changeState('saved');
                    })
                    .catch(function(error) {
                        saveButton.changeState('not-saved');
                        self.hasUnsavedChanges = true;
                    })
                    .finally(function() {
                        self.isSaving = false;

                        if (self.hasUnsavedChanges) {
                            self.save();
                        }
                    });
            });
        },

        download: function() {
            var now = new Date();
            var fileName = 'Image-' + dateToString(now, 'dd-mm-yyyy_H-M-S') + '.png';

            app.toBlob(function(blob) {
                saveAs(blob, fileName);
            });
        },

        delete: function() {
            if (!this.imageStorage) {
                return
            }

            return this.imageStorage
                .delete()
                .then(function() {
                    console.log('IMAGE WAS DELETED');
                })
                .catch(function(error) {
                    console.log('IMAGE WAN\'T DELETED');
                });
        }
    };


    var toolConfigs = {
        enabledToolButton: null,
        enabledOptions: [],

        options: {
            size: document.getElementById('sizeOption'),
            textSize: document.getElementById('textSizeOption'),
            color: document.getElementById('colorOption'),
        },

        init: function() {
            document
                .querySelector('.tools')
                .addEventListener('click', this._handleChoosingTool.bind(this), false);
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
        _handleChoosingTool: function(event) {
            var button = event.target.closest('button');
            if (!button || this.enabledToolButton == button) {
                return;
            }

            this.selectTool(button);

            event.preventDefault();
        }
    };


    var menuConfigs = {
        menuToggleBtn: document.getElementById('menu-toggle'),
        menuElement: document.getElementsByClassName('menu')[0],

        saveBtn: document.getElementById('saveBtn'),
        fileBtn: document.getElementById('fileBtn'),
        downloadBtn: document.getElementById('downloadBtn'),

        init: function() {
            var self = this;

            this.menuToggleBtn.addEventListener('click', function(event) {
                self.toggleMenu();
                event.preventDefault();
            }, false);

            this.saveBtn.addEventListener('click', function(event) {
                imageManager.save();
                event.preventDefault();
            }, false);

            this.fileBtn.addEventListener('change', function(event) {
                var fileBtn = event.target;

                if (fileBtn.files.length) {
                    app.loadImageFromFileObject(fileBtn.files[0]);
                }
                event.preventDefault();
            }, false);

            this.downloadBtn.addEventListener('click', function(event) {
                imageManager.download();
                event.preventDefault();
            }, false);
        },

        toggleMenu: function() {
            this.menuToggleBtn.classList.toggle('active');

            if (this.menuElement.dataset.open == undefined) {
                this.menuElement.dataset.open = '';
            } else {
                delete this.menuElement.dataset.open;
            }
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
            var svgIcon = this.colorPickerButton.querySelector('svg');
            svgIcon.style.fill = colorPicker.value;
            svgIcon.style.stroke = colorPicker.value;

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

            event.preventDefault();
        }
    };

    var sizeOption = Object.create(baseSizeOption);

    var textSizeOption = Object.create(baseSizeOption);


    var zoomOption = {
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


    var saveButton = {
        buttonElement: null,
        lightIndicatorElement: null,
        lightColor: 'green',

        init: function() {
            this.buttonElement = document.getElementById('saveBtn');
            this.savingStatusElement = document.getElementById('savingStatus');
            this.lightIndicatorElement = this.buttonElement.querySelector('.light');
        },

        changeState: function(state) {
            switch (state) {
                case 'saving':
                    this.lightColor = this.lightColor == 'red' ? 'yellow' : this.lightColor;
                    this._changeText('Saving');
                    this._changeLightIndicator(this.lightColor, true)
                    break;
                case 'saved':
                    this.lightColor = 'green';
                    this._changeText('Saved');
                    this._changeLightIndicator(this.lightColor, false)
                    break;
                case 'not-saved':
                    this.lightColor = 'red';
                    this._changeText('Not saved');
                    this._changeLightIndicator(this.lightColor, false)
                    break;
            }
        },

        _changeText: function(text) {
            this.savingStatusElement.textContent = text;
        },

        _changeLightIndicator: function(color, isLighting) {
            var classNames = ['light', 'light-' + color];
            if (isLighting) {
                classNames.push('lighting');
            }

            this.lightIndicatorElement.className = classNames.join(' ');
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
            app.loadImageFromDataTransfer(event.dataTransfer);
            event.preventDefault();
        }
    };


    var spinner = {
        blockScreenElement: document.getElementById('spinner'),
        iconElement: document.querySelector('#spinner svg use'),

        init: function() {},
        showDropArea: function() {
            this.blockScreenElement.screenBlock.open({
                message: 'Drop an image here',
                withBorder: true
            });
            this.iconElement.setAttribute('xlink:href', 'img/icons.svg#image');
        },
        showLoadingMessage: function() {
            this.blockScreenElement.screenBlock.open({
                message: 'Loading an image',
                loading: true
            });
            this.iconElement.setAttribute('xlink:href', 'img/icons.svg#coffee');
        },
        showSavingMessage: function() {
            this.blockScreenElement.screenBlock.open({
                message: 'Saving the image',
                loading: true
            });
            this.iconElement.setAttribute('xlink:href', 'img/icons.svg#coffee');
        },
        close: function() {
            this.blockScreenElement.screenBlock.close();
        }
    };


    function activate() {
        toolConfigs.init();
        menuConfigs.init();
        colorOption.init();
        sizeOption.init(
            'size',
            document.getElementById('sizeOption'),
            document.getElementById('sizeOptionInput')
        );
        textSizeOption.init(
            'textSize',
            document.getElementById('textSizeOption'),
            document.getElementById('textSizeOptionInput')
        );
        zoomOption.init();
        saveButton.init();
        dropImageOption.init();
        spinner.init();
        imageManager.init();


        window.addEventListener('resize', function(event) {
            app.zoom();
            app.resizeCanvas();
            app.draw();
        }, false);

        window.addEventListener('keydown', function(event) {
            if (event.keyCode === 90 && event.ctrlKey) {
                // Ctrl + Z
                app.removeShape();
            } else if (event.keyCode === 83 && event.ctrlKey) {
                // Ctrl + S
                imageManager.save();
            } else {
                return
            }

            event.preventDefault();
        }, false);

        window.addEventListener('paste', function(event) {
            app.loadImageFromDataTransfer(event.clipboardData);
            event.preventDefault();
        }, false);

        window.addEventListener('beforeunload', function(event) {
            if (imageManager.hasUnsavedChanges) {
                imageManager.save();
            }

            if (imageManager.hasUnsavedChanges || imageManager.isSaving) {
                event.preventDefault();
                event.returnValue = '';
            }
        }, false);

        app.on('image-loading', function() {
            spinner.showLoadingMessage();
        });

        app.on('image-loaded', function hideWelcomeScreen() {
            welcome.modal.close();
            app.off('image-loaded', hideWelcomeScreen);
        });
        app.on('image-loaded', function() {
            imageManager.onLoadSuccess();
            spinner.close();
        });
        app.on('image-not-loaded', function() {
            imageManager.onLoadFailure();
            spinner.close();
        });
        app.on('image-changed', function() {
            imageManager.hasUnsavedChanges = true;
            imageManager.save();
        });

        var imageId = imageManager.parseImageIdFromLocation();
        if (imageId) {
            imageManager.loadImageFromStorage(imageId);
        }

        window.imageManager = imageManager;
        window.spinner = spinner;
    }

    activate();
};
