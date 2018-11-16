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

        if (event) {
            event.preventDefault();
        }
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

        if (event) {
            event.preventDefault();
        }
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
    }

    return initializeControls;
})();
