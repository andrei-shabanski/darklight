'use strict';

var initializeUI = function(app) {
    var textButton = document.getElementById('textBtn');
    var penButton = document.getElementById('penBtn');
    var rectangleButton = document.getElementById('rectangleBtn');
    var ellipseButton = document.getElementById('ellipseBtn');
    var lineButton = document.getElementById('lineBtn');
    var arrowButton = document.getElementById('arrowBtn');
    var cropButton = document.getElementById('cropBtn');

    var colorOption = document.getElementById('colorOption');
    var zoomOption = document.getElementById('zoomOption');
    var sizeOption = document.getElementById('sizeOption');
    var textSizeOption = document.getElementById('textSizeOption');

    var buttons = [textButton, penButton, rectangleButton, ellipseButton, lineButton, arrowButton, cropButton];
    var options = [colorOption, sizeOption, textSizeOption];
    var globalOptions = [zoomOption];

    var toolConfigs = [{
        tool: 'text',
        button: textButton,
        options: [textSizeOption, colorOption]
    }, {
        tool: 'pen',
        button: penButton,
        options: [sizeOption, colorOption]
    }, {
        tool: 'rectangle',
        button: rectangleButton,
        options: [sizeOption, colorOption]
    }, {
        tool: 'ellipse',
        button: ellipseButton,
        options: [sizeOption, colorOption]
    }, {
        tool: 'line',
        button: lineButton,
        options: [sizeOption, colorOption]
    }, {
        tool: 'arrow',
        button: arrowButton,
        options: [sizeOption, colorOption]
    }, {
        tool: 'crop',
        button: cropButton,
        options: [],
    }];

    var activeToolConfig = null;

    var colorOption = {
        colorDropdown: document.getElementById('colorOption'),
        colorDropdownToggle: colorOption.querySelector('.dropdown-toggle'),
        colorPickerButton: document.getElementById('colorPickerButton'),
        colorPicker: document.getElementById('colorPicker'),

        init: function() {
            this.colorPickerButton.addEventListener('click', this.openPicker.bind(this));
            this.colorPicker.addEventListener('change', this.changePicker.bind(this));
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
        inputPreviousValue: null,
        inputValueUnit: 'px',

        _appOptionName: null,

        init: function() {
            this.previousInputValue = this.input.value;

            this.input.addEventListener('input', this._inputInput.bind(this));
            this.input.addEventListener('change', this._inputChange.bind(this));

            this._inputChange();
        },
        setSize: function(size) {
            app.setOption(this._appOptionName, size);

            this.input.value = size + this.inputValueUnit;
        },
        increaseSize: function() {
            if (app.options[this._appOptionName] >= 99) {
                return
            }

            var newSize = app.options[this._appOptionName] + 1;
            this.setSize(newSize);
        },
        decreaseSize: function() {
            if (app.options[this._appOptionName] <= 1) {
                return
            }

            var newSize = app.options[this._appOptionName] - 1;
            this.setSize(newSize);
        },
        _inputInput: function() {
            var sizeStr = this.input.value;
            if (sizeStr.match('^\\d{0,2}?' + this.inputValueUnit + '$') == null) {
                this.input.value = this.previousInputValue;
                return;
            }

            this.previousInputValue = this.input.value;
        },
        _inputChange: function() {
            var sizeStr = this.input.value;
            var size = +sizeStr.slice(0, sizeStr.length - 2);

            if (size === 0) {
                size = 1;
            }

            this.setSize(size);
        }
    };

    var sizeOption = Object.create(baseSizeOption);
    sizeOption.input = document.getElementById('sizeOptionInput');
    sizeOption._appOptionName = 'size';

    var textSizeOption = Object.create(baseSizeOption);
    textSizeOption.input = document.getElementById('textSizeOptionInput');
    textSizeOption._appOptionName = 'textSize';

    toolConfigs.forEach(function(toolConfig) {
        toolConfig.button.addEventListener('click', function(event) {
            if (toolConfig == activeToolConfig) {
                event.preventDefault();
            }

            // deactivate a previous button and options
            if (activeToolConfig) {
                activeToolConfig.button.classList.toggle('active');
                activeToolConfig.options.forEach(function(option) {
                    option.classList.add('hidden');
                });
            }

            // activate a new button and options
            toolConfig.button.classList.toggle('active');
            toolConfig.options.forEach(function(option) {
                option.classList.remove('hidden');
            });

            activeToolConfig = toolConfig;

            app.selectTool(toolConfig.tool);

            event.preventDefault();
        });
    });

    zoomOption.addEventListener('change', function(event) {
        var scalePersent = event.target.valueAsNumber;

        if (app.options.originalScale) {
            var scale = app.options.originalScale / scalePersent;
        } else {
            scale = 1;
        }

        app.zoom(scale);
        app.resizeCanvas();
        app.draw();

        event.preventDefault();
    });

    colorOption.init();
    window.colorOption = colorOption;
    document.querySelector('#colorOption .active').click();

    sizeOption.init();
    window.sizeOption = sizeOption;

    textSizeOption.init();
    window.textSizeOption = textSizeOption;
};
