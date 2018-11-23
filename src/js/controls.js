'use strict';

var initializeControls = (function() {
    function Modal(modalElement) {
        modalElement.modal = this;

        this.open = this.open.bind(this);
        this.close = this.close.bind(this);

        this.modalElement = modalElement;

        modalElement
            .querySelectorAll('[data-modal-close]')
            .forEach(function(closeButton) {
                closeButton.addEventListener('click', this.close);
            }.bind(this));
    }

    Modal.prototype.open = function(event) {
        this.modalElement.dataset.open = '';

        if (event) {
            event.preventDefault();
        }
    }

    Modal.prototype.close = function(event) {
        delete this.modalElement.dataset.open;

        if (event) {
            event.preventDefault();
        }
    }



    function Dropdown(dropdownElement) {
        dropdownElement.dropdown = this;

        this.open = this.open.bind(this);
        this.close = this.close.bind(this);

        this.dropdownElement = dropdownElement;
        this.dropdownToggleElement = dropdownElement.querySelector('.dropdown-toggle');

        this.dropdownToggleElement.addEventListener('click', this.open, false);
    }

    Dropdown.prototype.open = function(event) {
        this.dropdownElement.dataset.open = 'open';

        this.dropdownToggleElement.removeEventListener('click', this.open);
        this.dropdownToggleElement.addEventListener('click', this.close, false);
        window.addEventListener('click', this.close, true);
    };

    Dropdown.prototype.close = function(event) {
        if (event && event.target.closest('[data-dropdown-noclose]') != null) {
            event.preventDefault();
            return;
        }

        delete this.dropdownElement.dataset.open;

        this.dropdownToggleElement.removeEventListener('click', this.close);
        this.dropdownToggleElement.addEventListener('click', this.open, false);
        window.removeEventListener('click', this.close);
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
            this.element.classList.add('loading');
        } else {
            this.element.classList.remove('loading');
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

    ScreenBlock.prototype.close = function(event) {
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
