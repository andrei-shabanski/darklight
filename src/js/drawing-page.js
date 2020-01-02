import { globalLogger as logger } from '../utils/logging';
import { copyToClipboard, randomString } from '../utils/other';
import getFileBucket from '../services/buckets';

const buildImagePath = imageId => `images/${imageId}`;

export const initializePage = function(desk) {
  const imageManager = {
    imageStorage: getFileBucket(),
    loadingImageFromUrl: false,

    imageEditLinkBtn: document.getElementById('imageEditLinkBtn'),
    imageDirectLinkBtn: document.getElementById('imageDirectLinkBtn'),

    isSaving: false,
    hasUnsavedChanges: false,

    init() {},

    onLoadSuccess() {
      logger.debug('Image was loaded.');

      // scaleOption.fillIn();

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
      this.createImageStorage(imageId);
      this.loadingImageFromUrl = true;

      this.imageStorage
      .read(buildImagePath(this.imageId))
      .then(file => desk.loadImageFromFileObject(file));
    },

    setImageIdToLocation(imageId) {
      history.pushState({ imageId }, '', imageId);
    },

    createImageStorage(imageId) {
      if (!imageId) {
        imageId = `${randomString()}.png`;
        this.setImageIdToLocation(imageId);
      }
      this.imageId = imageId;;
    },

    save(force) {
      force = force !== null ? force : false;

      if ((!this.hasUnsavedChanges || this.isSaving) && !force) {
        return;
      }

      const self = this;

      this.hasUnsavedChanges = false;
      this.isSaving = true;

      // TODO: call dispatch() to set the saveStatus
      // saveButton.changeState('saving');

      return desk.toBlob(function(blob) {
        self.imageStorage
        .write(buildImagePath(self.imageId), blob)
        .then(function(snapshot) {
          // TODO: call dispatch() to set the saveStatus
          // saveButton.changeState('saved');
        })
        .catch(function(error) {
          // TODO: call dispatch() to set the saveStatus
          // saveButton.changeState('not-saved');
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

    delete() {
      if (!this.imageStorage) {
        return;
      }

      return this.imageStorage
      .delete(buildImagePath(this.imageId))
      .then(function() {
        console.log('IMAGE WAS DELETED');
      })
      .catch(function(error) {
        console.log("IMAGE WAN'T DELETED");
      });
    },
  };

  const menuConfigs = {
    menuToggleBtn: document.getElementById('menu-toggle'),
    menuElement: document.getElementsByClassName('menu')[0],

    fileBtn: document.getElementById('fileBtn'),

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
    menuConfigs.init();

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

    // const imageId = imageManager.parseImageIdFromLocation();
    // if (imageId) {
    //   imageManager.loadImageFromStorage(imageId);
    // }

    window.imageManager = imageManager;
    window.spinner = spinner;
  }

  initialize();
};
