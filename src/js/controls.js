'use strict';

(function() {
    function Modal(element) {
        var self = this;

        this.modalElement = element;
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
    };

    Modal.prototype.close = function() {
        delete this.modalElement.dataset.open;
    };


    function Dropdown(element) {
        element.dropdown = this;

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

        this.dropdownElement = element;
        this.dropdownToggleElement = element.querySelector('.dropdown-toggle');

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
    };


    function InputDropdown(element, valueConfig) {
        this.dropdownElement = element;
        this.inputElement = element.querySelector('.dropdown-toggle input');

        var defaultValueConfig = {
            inputValuePattern: '.*',
            convertValue: function(rawValue) { return rawValue },
            validateValue: function(value) { return true; },
            changeValue: function(value) {}
        };

        Object.assign(this, defaultValueConfig, valueConfig);

        this._currentRawValue = this.inputElement.value;
        this._typingRawValue = this.inputElement.value;
        this._currentValue = this._convert(this.inputElement.value);

        this.inputElement.addEventListener('input', this._inputTyping.bind(this), false);
        this.inputElement.addEventListener('change', this._inputChange.bind(this), false);
        this.dropdownElement
            .querySelector('.dropdown-menu')
            .addEventListener('click', this._handleAction.bind(this), false);
    }

    InputDropdown.prototype.setValue = function(value) {
        if (this._validate(value)) {
            this.changeValue(value);
            this._currentValue = value;
        }

        this._currentRawValue = this._valueToString(this._currentValue);
        this._typingRawValue = this._currentRawValue;

        this.inputElement.value = this._currentRawValue;
    };

    InputDropdown.prototype._convert = function(rawValue) {
        return this.convertValue(rawValue);
    };

    InputDropdown.prototype._validate = function(value) {
        return this.validateValue(value);
    };

    InputDropdown.prototype._valueToString = function(value) {
        if (value === null) {
            return '';
        }
        return value.toString();
    };

    InputDropdown.prototype._inputTyping = function(event) {
        var rawValue = this.inputElement.value;
        if (rawValue.match(this.inputValuePattern)) {
            this._typingRawValue = rawValue;
        } else {
            this.inputElement.value = this._typingRawValue;
        }

        event.preventDefault();
    };

    InputDropdown.prototype._inputChange = function (event) {
        var value = this._convert(this.inputElement.value);
        this.setValue(value);

        event.preventDefault();
    };

    InputDropdown.prototype._handleAction = function(event) {
        var button = event.target.closest('button');
        if (!button) {
            return;
        }

        if (button.dataset.optionValue) {
            var value = button.dataset.optionValue;
            this.setValue(value);
        } else if (button.dataset.optionAction) {
            var actionFunc = this[button.dataset.optionAction];
            if (actionFunc) {
                actionFunc.apply(this);
            }
        }

        event.preventDefault();
    };


    function NumericInputDropdown(element, valueConfig) {
        var defaultValueConfig = {
            inputValuePrefix: '',
            inputValueSuffix: '',
            valueMin: null,
            valueMax: null,
            valueDelta: 1,
            convertValue: function(rawValue) {
                try {
                    var number = rawValue.slice(this.inputValuePrefix.length, rawValue.length - this.inputValueSuffix.length);
                    return (number.length > 0) ? +number : null;
                } catch (e) {
                    return null;
                }
            }
        };

        valueConfig = Object.assign({}, defaultValueConfig, valueConfig || {});

        NumericInputDropdown.super.constructor.call(this, element, valueConfig);
    }

    inherit(NumericInputDropdown, InputDropdown);

    NumericInputDropdown.prototype._convert = function(rawValue) {
        var value = NumericInputDropdown.super._convert.call(this, rawValue);
        if (value === null) {
            return null;
        }

        if (this.valueMin !== null && value < this.valueMin) {
            value = this.valueMin;
        } else if (this.valueMax !== null && value > this.valueMax) {
            value = this.valueMax;
        }

        return value;
    };

    NumericInputDropdown.prototype._validate = function(value) {
        var result = NumericInputDropdown.super._validate.call(this, value);
        if (!result) {
            return false;
        }

        if (this.valueMin !== null && value < this.valueMin) {
            return false;
        } else if (this.valueMax !== null && value > this.valueMax) {
            return false
        }

        return true;
    };

    NumericInputDropdown.prototype._valueToString = function(value) {
        return `${this.inputValuePrefix}${value}${this.inputValueSuffix}`
    };

    NumericInputDropdown.prototype.decrease = function() {
        var value = this._currentValue - this.valueDelta;
        if (this.valueMin !== null && value < this.valueMin) {
            value = this.valueMin;
        }
        this.setValue(value);
    };

    NumericInputDropdown.prototype.increase = function() {
        var value = this._currentValue + this.valueDelta;
        if (this.valueMax !== null && value > this.valueMax) {
            value = this.valueMax;
        }
        this.setValue(value);
    };


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
    };

    ScreenBlock.prototype.close = function() {
        delete this.element.dataset.open;
    };


    function initialize() {
        window.Modal = Modal;
        window.Dropdown = Dropdown;
        window.InputDropdown = InputDropdown;
        window.NumericInputDropdown = NumericInputDropdown;
        window.ScreenBlock = ScreenBlock;

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

    initialize();
})();
