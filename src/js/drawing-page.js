export const initializePage = function(desk) {
  const menuConfigs = {
    menuToggleBtn: document.getElementById('menu-toggle'),
    menuElement: document.getElementsByClassName('menu')[0],

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

    window.addEventListener(
      'keydown',
      function(event) {
        if (event.keyCode === 90 && event.ctrlKey) {
          // Ctrl + Z
          desk.removeShape();
        } else if (event.keyCode === 83 && event.ctrlKey) {
          // Ctrl + S
          // imageManager.save();
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

    // window.addEventListener(
    //   'beforeunload',
    //   function(event) {
    //     if (imageManager.hasUnsavedChanges) {
    //       imageManager.save();
    //     }
    //
    //     if (imageManager.hasUnsavedChanges || imageManager.isSaving) {
    //       event.preventDefault();
    //       event.returnValue = '';
    //     }
    //   },
    //   false
    // );

    window.spinner = spinner;
  }

  initialize();
};
