'use strict';

var initializeControls = (function() {
    function Modal(modalElement) {
        var self = this;

        this.modalElement = modalElement;
        this.modalElement.modal = this;

        this.modalElement
            .querySelectorAll('[data-modal-close]')
            .forEach(function(closeButton) {
                closeButton.addEventListener('click', function(event) {
                    self.close();
                    event.preventDefault();
                });
            });
    }

    Modal.prototype.open = function() {
        this.modalElement.dataset.open = '';
    }

    Modal.prototype.close = function() {
        delete this.modalElement.dataset.open;
    }



    function Dropdown(dropdownElement) {
        dropdownElement.dropdown = this;

        this.openHandler = function(event) {
            this.open();
        }.bind(this);

        this.closeHandler = function(event) {
            if (event.target.closest('[data-dropdown-noclose]') != null) {
                event.preventDefault();
                return;
            }

            this.close();
        }.bind(this);

        this.dropdownElement = dropdownElement;
        this.dropdownToggleElement = dropdownElement.querySelector('.dropdown-toggle');

        this.dropdownToggleElement.addEventListener('click', this.openHandler, false);
    }

    Dropdown.prototype.open = function() {
        this.dropdownElement.dataset.open = 'open';

        this.dropdownToggleElement.removeEventListener('click', this.openHandler);
        this.dropdownToggleElement.addEventListener('click', this.closeHandler, false);
        window.addEventListener('click', this.closeHandler, true);
    };

    Dropdown.prototype.close = function() {
        delete this.dropdownElement.dataset.open;

        this.dropdownToggleElement.removeEventListener('click', this.closeHandler);
        this.dropdownToggleElement.addEventListener('click', this.openHandler, false);
        window.removeEventListener('click', this.closeHandler);
    }



    function ScreenBlock(element) {
        element.screenBlock = this;

        this.element = element;
        this.messageElement = element.querySelector('.screen-message');
        this.imageElement = element.querySelector('.screen-image');

        this._options = {};
    }

    ScreenBlock.prototype.open = function(options) {
        this.messageElement.innerText = options.message || '';
        if (options.loading) {
            this.messageElement.classList.add('loading');
        } else {
            this.messageElement.classList.remove('loading');
        }

        if (this._options.imageClass) {
            this.imageElement.classList.remove(this._options.imageClass);
        }
        if (options.imageClass) {
            this.imageElement.classList.add(options.imageClass);
        }

        if (options.withBorder) {
            this.element.classList.add('with-border');
        } else {
            this.element.classList.remove('with-border');
        }

        this.element.dataset.open = '';
        this._options = options;
    }

    ScreenBlock.prototype.close = function() {
        delete this.element.dataset.open;
    }



    function initializeControls() {
        document
            .querySelectorAll('.dropdown')
            .forEach(function(dropdown) {
                new Dropdown(dropdown);
            });

        document
            .querySelectorAll('.modal')
            .forEach(function(modal) {
                new Modal(modal);
            });

        document
            .querySelectorAll('.screen-block')
            .forEach(function(element) {
                new ScreenBlock(element);
            });
    }

    return initializeControls;
})();
