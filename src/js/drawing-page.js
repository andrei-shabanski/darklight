import * as firebase from 'firebase/app';
import { saveAs } from 'file-saver';

import { globalLogger as logger } from '../utils/logging';
import { inherit, dateToString, copyToClipboard, randomString } from '../utils/other';
import { NumericInputDropdown } from './controls';

export const initializePage = function(desk) {
  function FirebaseImageStorage(imageId) {
    this.imageId = imageId;
    this.url = `https://firebasestorage.googleapis.com/v0/b/darklight-image-editor.appspot.com/o/images%2F${imageId}?alt=media`;
    this._refFile = firebase.storage().ref(`images/${imageId}`);
  }

  FirebaseImageStorage.prototype.load = function() {
    return this._refFile.getDownloadURL();
  };

  FirebaseImageStorage.prototype.save = function(blob) {
    return this._refFile.put(blob);
  };

  FirebaseImageStorage.prototype.delete = function() {
    return this._refFile.delete();
  };

  const imageManager = {
    imageStorage: null,
    loadingImageFromUrl: false,

    saveBtn: document.getElementById('saveBtn'),
    imageEditLinkBtn: document.getElementById('imageEditLinkBtn'),
    imageDirectLinkBtn: document.getElementById('imageDirectLinkBtn'),

    isSaving: false,
    hasUnsavedChanges: false,

    init() {
      const self = this;

      this.imageEditLinkBtn.addEventListener(
        'click',
        function(event) {
          copyToClipboard(location.href);
          event.preventDefault();
        },
        false
      );
      this.imageDirectLinkBtn.addEventListener(
        'focus',
        function(event) {
          copyToClipboard(self.imageStorage.url);
          event.preventDefault();
        },
        false
      );
    },

    onLoadSuccess() {
      logger.debug('Image was loaded.');

      scaleOption.fillIn();

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

    onLoadFailure(error) {
      logger.error('Image was not loaded. ', error);

      if (this.loadingImageFromUrl) {
        this.loadingImageFromUrl = false;
      }
    },

    loadImageFromStorage(imageId) {
      const self = this;

      this.createImageStorage(imageId);
      this.loadingImageFromUrl = true;
      // this.imageStorage
      //     .load()
      //     .then(desk.loadImageFromUrl.bind(desk))
      //     .catch(function(error) {
      //         self.onLoadFailure(error);
      //     });
      desk.loadImageFromUrl(this.imageStorage.url);
    },

    setImageIdToLocation(imageId) {
      history.pushState({ imageId }, '', imageId);
    },

    parseImageIdFromLocation() {
      const matchedPath = location.pathname.match(/\/(\w+\.png)/);
      if (matchedPath) {
        return matchedPath[1];
      }

      return null;
    },

    createImageStorage(imageId) {
      if (!imageId) {
        imageId = `${randomString()}.png`;
        this.setImageIdToLocation(imageId);
      }

      this.imageStorage = new FirebaseImageStorage(imageId);
    },

    save(force) {
      force = force !== null ? force : false;

      if ((!this.hasUnsavedChanges || this.isSaving) && !force) {
        return;
      }

      const self = this;

      this.hasUnsavedChanges = false;
      this.isSaving = true;

      saveButton.changeState('saving');

      return desk.toBlob(function(blob) {
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

    download() {
      const now = new Date();
      const fileName = `Image-${dateToString(now, 'dd-mm-yyyy_H-M-S')}.png`;

      desk.toBlob(function(blob) {
        saveAs(blob, fileName);
      });
    },

    delete() {
      if (!this.imageStorage) {
        return;
      }

      return this.imageStorage
        .delete()
        .then(function() {
          console.log('IMAGE WAS DELETED');
        })
        .catch(function(error) {
          console.log("IMAGE WAN'T DELETED");
        });
    },
  };

  const toolConfigs = {
    enabledToolButton: null,
    enabledOptions: [],

    options: {
      size: document.getElementById('sizeOption'),
      textSize: document.getElementById('textSizeOption'),
      color: document.getElementById('colorOption'),
    },

    init() {
      document
        .querySelector('.tools')
        .addEventListener('click', this._handleChoosingTool.bind(this), false);
    },
    selectTool(button) {
      const { tool } = button.dataset;
      const options = button.dataset.options ? button.dataset.options.split(' ') : [];
      if (!tool) {
        return;
      }

      if (this.enabledToolButton) {
        this.enabledToolButton.classList.toggle('active');
        this.enabledOptions.forEach(
          function(optionName) {
            this.options[optionName].classList.add('hidden');
          }.bind(this)
        );
      }

      if (button !== this.enabledToolButton) {
        button.classList.toggle('active');

        options.forEach(
          function(optionName) {
            this.options[optionName].classList.remove('hidden');
          }.bind(this)
        );

        this.enabledToolButton = button;
        this.enabledOptions = options;
      } else {
        this.enabledToolButton = null;
        this.enabledOptions = [];
      }

      desk.selectTool(tool);
    },
    _handleChoosingTool(event) {
      const button = event.target.closest('button');
      if (!button) {
        return;
      }

      this.selectTool(button);

      event.preventDefault();
    },
  };

  const menuConfigs = {
    menuToggleBtn: document.getElementById('menu-toggle'),
    menuElement: document.getElementsByClassName('menu')[0],

    saveBtn: document.getElementById('saveBtn'),
    fileBtn: document.getElementById('fileBtn'),
    downloadBtn: document.getElementById('downloadBtn'),

    init() {
      const self = this;

      this.menuToggleBtn.addEventListener(
        'click',
        function(event) {
          self.toggleMenu();
          event.preventDefault();
        },
        false
      );

      this.saveBtn.addEventListener(
        'click',
        function(event) {
          imageManager.save();
          event.preventDefault();
        },
        false
      );

      this.fileBtn.addEventListener(
        'change',
        function(event) {
          const fileBtn = event.target;

          if (fileBtn.files.length) {
            desk.loadImageFromFileObject(fileBtn.files[0]);
          }
          event.preventDefault();
        },
        false
      );

      this.downloadBtn.addEventListener(
        'click',
        function(event) {
          imageManager.download();
          event.preventDefault();
        },
        false
      );
    },

    toggleMenu() {
      this.menuToggleBtn.classList.toggle('active');

      if (this.menuElement.dataset.open === null) {
        this.menuElement.dataset.open = '';
      } else {
        delete this.menuElement.dataset.open;
      }
    },
  };

  const colorOption = {
    colorDropdown: document.getElementById('colorOption'),
    colorDropdownToggle: document.querySelector('#colorOption .dropdown-toggle'),
    colorPickerButton: document.querySelector('#colorOption .picker-button'),
    colorPicker: document.getElementById('colorPicker'),

    init() {
      this.colorPicker.addEventListener('change', this.changePicker.bind(this), false);

      this.colorDropdown
        .querySelector('.dropdown-menu')
        .addEventListener('click', this._handleColorAction.bind(this), false);
    },
    setColor(button, color) {
      this.colorDropdown.querySelectorAll('.active').forEach(function(element) {
        element.classList.remove('active');
      });
      button.classList.add('active');

      const svgRect = this.colorDropdownToggle.querySelector('svg');

      svgRect.style.fill = color;
      svgRect.style.stroke = color;

      desk.setOption('color', color);
    },
    openPicker() {
      this.colorPicker.value = desk.options.color;
      this.colorPicker.click();
    },
    changePicker() {
      const svgIcon = this.colorPickerButton.querySelector('svg');
      svgIcon.style.fill = colorPicker.value;
      svgIcon.style.stroke = colorPicker.value;

      this.setColor(this.colorPickerButton, this.colorPicker.value);
    },
    _handleColorAction(event) {
      const button = event.target.closest('button');
      if (!button) {
        return;
      }

      if (button.dataset.colorSet) {
        const color = button.dataset.colorSet;
        this.setColor(button, color);
      } else if (button.dataset.colorPicker !== null) {
        this.openPicker();
      }

      event.preventDefault();
    },
  };

  function ScaleInputDropdown(element) {
    const valueConfig = {
      inputValuePattern: /^\d{0,3}?%$/,
      inputValueSuffix: '%',
      valueMin: 0.1,
      valueMax: 3,
      valueDelta: 0.1,
      convertValue(rawValue) {
        try {
          const number = rawValue.slice(
            this.inputValuePrefix.length,
            rawValue.length - this.inputValueSuffix.length
          );
          return number.length > 0 ? +number / 100 : null;
        } catch (e) {
          return null;
        }
      },
      changeValue(value) {
        desk.setOption('scale', value);
      },
    };

    this._fillingIn = true;
    this._canvasesContainer = document.querySelector('.canvases');
    this._canvases = this._canvasesContainer.querySelectorAll('canvas');

    ScaleInputDropdown.super.constructor.call(this, element, valueConfig);

    document
      .getElementById('root')
      .addEventListener('mousewheel', this._wheelWindow.bind(this), false);
    window.addEventListener('resize', this._resizeWindow.bind(this), false);
  }

  inherit(ScaleInputDropdown, NumericInputDropdown);

  ScaleInputDropdown.prototype.setValue = function(value) {
    ScaleInputDropdown.super.setValue.call(this, value);

    this._fillingIn = false;

    this._zoomCanvas();
    this._hackCanvasCentering();
  };

  ScaleInputDropdown.prototype._valueToString = function(value) {
    value = Math.round(value * 100);
    return ScaleInputDropdown.super._valueToString.call(this, value);
  };

  ScaleInputDropdown.prototype.fillIn = function() {
    if (!desk.image) {
      return;
    }

    const widthScale = this._canvasesContainer.offsetWidth / desk.image.width;
    const heightScale = this._canvasesContainer.offsetHeight / desk.image.height;
    const scale = Math.min(widthScale, heightScale, 1);

    this.setValue(scale);

    this._fillingIn = true;
  };

  ScaleInputDropdown.prototype._wheelWindow = function(event) {
    const onCanvas = event.target.closest('canvas') !== null;

    if (event.ctrlKey) {
      event.preventDefault();
    }

    if (event.ctrlKey && onCanvas) {
      if (event.deltaY > 0) {
        this.decrease();
      } else {
        this.increase();
      }
    }
  };

  ScaleInputDropdown.prototype._resizeWindow = function(event) {
    if (this._fillingIn) {
      this.fillIn();
    }
  };

  ScaleInputDropdown.prototype._zoomCanvas = function() {
    const width = desk.image.width * this._currentValue;
    this._canvases.forEach(function(canvas) {
      canvas.style.width = `${width}px`;
    });
  };

  ScaleInputDropdown.prototype._hackCanvasCentering = function() {
    const canvasWidth = desk.image.width * this._currentValue;
    const canvasHeight = desk.image.height * this._currentValue;

    const left = canvasWidth >= this._canvasesContainer.offsetWidth ? 0 : null;
    const top = canvasHeight >= this._canvasesContainer.offsetHeight ? 0 : null;

    this._canvases.forEach(function(canvas) {
      canvas.style.left = left;
      canvas.style.top = top;
    });
  };

  var saveButton = {
    buttonElement: null,
    lightIndicatorElement: null,
    lightColor: 'green',

    init() {
      this.buttonElement = document.getElementById('saveBtn');
      this.savingStatusElement = document.getElementById('savingStatus');
      this.lightIndicatorElement = this.buttonElement.querySelector('.light');
    },

    changeState(state) {
      switch (state) {
        case 'saving':
          this.lightColor = this.lightColor === 'red' ? 'yellow' : this.lightColor;
          this._changeText('Saving');
          this._changeLightIndicator(this.lightColor, true);
          break;
        case 'saved':
          this.lightColor = 'green';
          this._changeText('Saved');
          this._changeLightIndicator(this.lightColor, false);
          break;
        case 'not-saved':
          this.lightColor = 'red';
          this._changeText('Not saved');
          this._changeLightIndicator(this.lightColor, false);
          break;
      }
    },

    _changeText(text) {
      this.savingStatusElement.textContent = text;
    },

    _changeLightIndicator(color, isLighting) {
      const classNames = ['light', `light-${color}`];
      if (isLighting) {
        classNames.push('lighting');
      }

      this.lightIndicatorElement.className = classNames.join(' ');
    },
  };

  let sizeOption;
  let textSizeOption;
  let scaleOption;

  const dropImageOption = {
    dropareaHiddingTimerID: null,
    dragoverLastTimeFired: null,

    init() {
      // Note that dragstart and dragend events are not fired when dragging a file into the browser from the OS.
      // (https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop)

      // So we will set up a timer to hide droparea when dragover event will no longer fire
      window.addEventListener('dragover', this._dragImage.bind(this), false);
      window.addEventListener('drop', this._dropImage.bind(this), false);
    },
    _dragImage(event) {
      this.dragoverLastTimeFired = new Date();

      if (!this.dropareaHiddingTimerID) {
        spinner.showDropArea();

        this.dropareaHiddingTimerID = setInterval(
          function() {
            const nowTime = new Date();
            if (nowTime - this.dragoverLastTimeFired < 150) {
              return;
            }

            spinner.close();

            clearInterval(this.dropareaHiddingTimerID);
            this.dropareaHiddingTimerID = null;
          }.bind(this),
          50
        );
      }

      event.preventDefault();
    },
    _dropImage(event) {
      desk.loadImageFromDataTransfer(event.dataTransfer);
      event.preventDefault();
    },
  };

  var spinner = {
    blockScreenElement: document.getElementById('spinner'),
    iconElement: document.querySelector('#spinner svg use'),

    init() {},
    showDropArea() {
      this.blockScreenElement.screenBlock.open({
        message: 'Drop an image here',
        withBorder: true,
      });
      this.iconElement.setAttribute('xlink:href', 'img/icons.svg#image');
    },
    showLoadingMessage() {
      this.blockScreenElement.screenBlock.open({
        message: 'Loading an image',
        loading: true,
      });
      this.iconElement.setAttribute('xlink:href', 'img/icons.svg#coffee');
    },
    showSavingMessage() {
      this.blockScreenElement.screenBlock.open({
        message: 'Saving the image',
        loading: true,
      });
      this.iconElement.setAttribute('xlink:href', 'img/icons.svg#coffee');
    },
    close() {
      this.blockScreenElement.screenBlock.close();
    },
  };

  function initialize() {
    toolConfigs.init();
    menuConfigs.init();
    colorOption.init();

    sizeOption = new NumericInputDropdown(document.getElementById('sizeOption'), {
      // inputValuePattern: /^\d{0,2}?px$/,
      inputValueSuffix: 'px',
      valueMin: 1,
      valueMax: 99,
      valueDelta: 2,
      changeValue(value) {
        desk.setOption('size', value);
      },
    });

    textSizeOption = new NumericInputDropdown(document.getElementById('textSizeOption'), {
      // inputValuePattern: /^\d{0,2}?px$/,
      inputValueSuffix: 'px',
      valueMin: 1,
      valueMax: 99,
      valueDelta: 2,
      changeValue(value) {
        desk.setOption('textSize', value);
      },
    });

    scaleOption = new ScaleInputDropdown(document.getElementById('scaleOption'));

    saveButton.init();
    dropImageOption.init();
    spinner.init();
    imageManager.init();

    window.addEventListener(
      'keydown',
      function(event) {
        if (event.keyCode === 90 && event.ctrlKey) {
          // Ctrl + Z
          desk.removeShape();
        } else if (event.keyCode === 83 && event.ctrlKey) {
          // Ctrl + S
          imageManager.save();
        } else {
          return;
        }

        event.preventDefault();
      },
      false
    );

    window.addEventListener(
      'paste',
      function(event) {
        desk.loadImageFromDataTransfer(event.clipboardData);
        event.preventDefault();
      },
      false
    );

    window.addEventListener(
      'beforeunload',
      function(event) {
        if (imageManager.hasUnsavedChanges) {
          imageManager.save();
        }

        if (imageManager.hasUnsavedChanges || imageManager.isSaving) {
          event.preventDefault();
          event.returnValue = '';
        }
      },
      false
    );

    desk.on('image-loading', function() {
      spinner.showLoadingMessage();
    });

    desk.on('image-loaded', function hideWelcomeScreen() {
      welcome.modal.close();
      desk.off('image-loaded', hideWelcomeScreen);
    });
    desk.on('image-loaded', function() {
      imageManager.onLoadSuccess();
      spinner.close();
    });
    desk.on('image-not-loaded', function() {
      imageManager.onLoadFailure();
      spinner.close();
    });
    desk.on('image-changed', function() {
      imageManager.hasUnsavedChanges = true;
      imageManager.save();
    });

    const imageId = imageManager.parseImageIdFromLocation();
    if (imageId) {
      imageManager.loadImageFromStorage(imageId);
    }

    window.imageManager = imageManager;
    window.spinner = spinner;
  }

  initialize();
};
